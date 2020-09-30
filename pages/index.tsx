import Nav from '../components/nav';
import Head from "next/head";
import { GetServerSideProps } from 'next'
import { getCollection, StampDoc } from '../utils/db';
import moment, { Moment } from 'moment';
import { useCallback, useEffect, useState } from 'react';

interface StampType<T = number> {
  date: T;
  type: "on" | "off";
}

interface Props {
  stamps: StampType[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const collection = await getCollection();
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const cursor = await collection.find({
    date: { $gte: new Date(date) },
  }, {
    sort: { date: -1 }
  });
  const docs = await cursor.toArray();
  if (docs.length < 1) {
    const prev = await collection.findOne({}, {
      sort: { date: -1 }
    }) || {
      date: new Date(0),
      type: "off",
    };
    docs.push(prev);
  }
  return {
    props: {
      stamps: docs.map(v => ({ date: v.date.getTime(), type: v.type }))
    }
  };
}

export default function IndexPage({ stamps: initialStamps }: Props) {
  moment.updateLocale("en", {
    longDateFormat: {
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      L: 'YYYY-MM-DD',
      LL: 'D MMMM YYYY',
      LLL: 'D MMMM YYYY HH:mm',
      LLLL: 'dddd, D MMMM YYYY HH:mm',
    },
  })

  const [stamps, setStamps] = useState<StampType<Moment>[]>(initialStamps.map(v => ({
    type: v.type,
    date: moment(v.date),
  })).sort((a, b) => (a.date.valueOf() - b.date.valueOf())));

  const [secondsNow, setSecondsNow] = useState(86400);
  const [submitting, setSubmitting] = useState(false);

  const lastStamp = stamps[stamps.length - 1];
  const lastType = lastStamp.type;
  const lastDate = lastStamp.date;

  const stamp = useCallback(async () => {
    setSubmitting(true);
    const rawResponse = await fetch('/api/stamps', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: lastType === "on" ? "off" : "on" })
    });
    const content = await rawResponse.json();
    const newStamp = {
      type: content.currentStatus,
      date: moment(content.currentDate),
    };

    setStamps([...stamps, newStamp]);
    setSubmitting(false);
  }, [stamps, setStamps, lastType, setSubmitting]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment();
      const mmtMidnight = now.clone().startOf('day');
      const diffSeconds = now.diff(mmtMidnight, 'seconds');
      setSecondsNow(diffSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [setSecondsNow]);

  return (
    <div>
      <Head>
        <title>Segment stamper</title>
      </Head>
      <Nav />
      <div className="container mx-auto">
        <div className="py-10">
          <h1 className="text-5xl text-center text-accent-1">
            Segment stamper
          </h1>
        </div>
        <div className="text-center">
          <div className="py-1">
            Last stamp was an{" "}
            <span className={`font-bold ${lastType === "on" ? "text-blue-600" : "text-green-600"}`}>{lastType}</span>{" "}
            stamp made <span className="font-bold">{lastDate.fromNow()}</span> on {lastDate.calendar()}.
          </div>
          <div>
            <button 
              disabled={submitting}
              onClick={stamp}
              className={`btn ${lastType === "on" ? "bg-green-500" : "bg-blue-500"}`}>
              {lastType === "on" ? "Stamp off" : "Stamp on"}
            </button>
          </div>
        </div>
        <div className="timeline vertical">
          {[6,5,4,3,2,1,0].map((v) => {
            const day = moment().subtract(v, "days");
            const dayStamps = stamps
              .filter(v => v.date.date() === day.date())
              .reduce((prev, curr) => {
                if (prev.length === 0) return [curr];
                if (prev[prev.length - 1].type !== curr.type) return [...prev, curr];
                return prev;
              }, [] as StampType<Moment>[]);

            const intervals: [number, number | null][] = [];
            let i = 0;
            
            while (i < dayStamps.length) {
              const stamp = dayStamps[i];
              const mmtMidnight = stamp.date.clone().startOf('day');
              const diffSeconds = stamp.date.diff(mmtMidnight, 'seconds');
              if (stamp.type === "on") {
                intervals.push([diffSeconds, null]);
              } else {
                if (intervals.length < 1) {
                  intervals.push([0, diffSeconds]);
                } else {
                  intervals[intervals.length - 1][1] = diffSeconds;
                }
              }
              i++;
            }

            if (intervals.length > 0 && intervals[intervals.length - 1][1] === null) {
              intervals[intervals.length - 1][1] = 86400;
            }
            
            return (
              <div className="row" key={v}>
                <span className="absolute">{day.format("ddd D MMM")}</span>
                {intervals.map(v => <span key={v[0]} className="cell" style={{
                  inlineSize: `${(v[1] - v[0]) / 864}%`,
                  marginInlineStart: `${v[0] / 864}%`,
                }}></span>)}
                {v === 0 && <span className="cell now" style={{
                  inlineSize: `${100 - (secondsNow / 864)}%`,
                  marginInlineStart: `${secondsNow / 864}%`,
                }}></span>}
              </div>
            );
          })}
          <div className="row-key">
            <span className="inline-block">0:00</span>
            <span className="inline-block">6:00</span>
            <span className="inline-block">12:00</span>
            <span className="inline-block">18:00</span>
            <span className="inline-block">24:00</span>
          </div>
        </div>
        <div className="my-4 details">
          <h2 className="text-2xl">Breakdowns</h2>
          {[6, 5, 4, 3, 2, 1, 0].map((v) => {
            const day = moment().subtract(v, "days");
            const dayStamps = stamps
              .filter(v => v.date.date() === day.date())
              .reduce((prev, curr) => {
                if (prev.length === 0) return [curr];
                if (prev[prev.length - 1].type !== curr.type) return [...prev, curr];
                return prev;
              }, [] as StampType<Moment>[]);

            const intervals: [Moment | null, Moment | null][] = [];
            let i = 0;

            while (i < dayStamps.length) {
              const stamp = dayStamps[i];
              if (stamp.type === "on") {
                intervals.push([stamp.date, null]);
              } else {
                if (intervals.length < 1) {
                  intervals.push([null, stamp.date]);
                } else {
                  intervals[intervals.length - 1][1] = stamp.date;
                }
              }
              i++;
            }

            return (
              <section key={v}>
                <h3 className="mt-2 text-xl">{day.format("ddd D MMM")}</h3>
                <ul className="list-disc list-inside">
                  {intervals.map(v => <li key={v[0].valueOf()}>
                    {v[0] ? v[0].format("LT") : "..."} — {v[1] ? v[1].format("LT") : "ongoing"}
                    {v[0] && v[1] && ` (${moment.duration(v[0].diff(v[1])).humanize()})`}
                  </li>)}
                  {intervals.length < 1 && <li>Nil</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  )
}
