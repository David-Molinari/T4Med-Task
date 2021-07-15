import { useEffect, useState } from "react";
import './App.css';
import moment from "moment";
import Nav from "./components/Nav";
import Graph from "./components/Graph";
import Ranges from "./Ranges.json";
import { isScrolledIntoView } from "./Utils";
import {
  useQuery,
  gql
} from "@apollo/client";
import { 
  IRange, 
  RangeTuple, 
  IData, 
  IDataResponse,
  IEdge
} from './GlobalTypes';

// const GET_RANGES = gql`
//   query GetRangesAndData {
//     ranges {
//       low_bound
//       high_bound
//       color
//     }
//   }
// `;

const GET_DATA = gql`
  query data($first: Int!, $after: String) {
    data(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          _id
          index
          result_id
          result_dt_tm
          glucose_level
          glucose_level_unit
          source
        }
      }
    }
  }
`;

function App(): JSX.Element {

  const [glucoseData, setGlucoseData] = useState<IData[]>([])
  const [glucoseRangeTuples, setGlucoseRangeTuples] = useState<RangeTuple[]>([])
  const [selectedDates, setSelectedDates] = useState({
    start: "",
    end: ""
  })
  const [hasNextPage, setHasNextPage] = useState<Boolean>(false)
  const [networkStatusLoading, setNetworkStatusLoading] = useState<boolean>(false)

  // const { loading, error, data } = useQuery<IRange[]>(GET_RANGES);

  const first = 10;
  const { loading, error, data, fetchMore, networkStatus } = useQuery<IDataResponse>(GET_DATA, {
    variables: { first },
    notifyOnNetworkStatusChange: true,
  });

  // On load of data, set initial state

  useEffect(()=> {
    if (!loading && data !== undefined) {
      let dataClone: IData[] = []
      data.data.edges.forEach((e: IEdge): void => {
        dataClone.push(e.node)
      })
      dataClone.sort((a: IData, b: IData): number => {
        return (
          new Date(a.result_dt_tm.slice(0,10)).getTime() - 
          new Date(b.result_dt_tm.slice(0,10)).getTime()
        )
      })
      console.log(dataClone)
      setGlucoseData(dataClone)
      let rangesToArrays: RangeTuple[] = []
      Ranges.forEach((r: IRange): void => {
        rangesToArrays.push([r.low_bound, r.high_bound, r.color])
      })
      rangesToArrays.sort(function(a: RangeTuple, b: RangeTuple): number {
        return a[0] - b[0];
      });
      setGlucoseRangeTuples(rangesToArrays)
      let startDT: string = dataClone[0].result_dt_tm
      let startD:string = moment(startDT.slice(0, startDT.search(" "))).format()
      let endDT:string = dataClone[dataClone.length - 1].result_dt_tm
      let endD:string = moment(endDT.slice(0, endDT.search(" "))).format()
      if (selectedDates.start == '' && selectedDates.end == '') {
        setSelectedDates({
          start: startD,
          end: endD
        })
      }
      setHasNextPage(data.data.pageInfo.hasNextPage)
    }
  }, [data])

  useEffect(()=> {
    setNetworkStatusLoading(networkStatus === 3)
  }, [networkStatus])

  if (error) {
    console.log(error)
  };

  useEffect(()=> {
    if (data && !loading && glucoseData.length) {
      const elem: HTMLElement | null = document.querySelector("#LoadMoreBtn")
      if (elem && isScrolledIntoView(elem)) {
        elem?.click();
      }
    }
  }, [$(window).height()])

  return (
    <>
      {data && !loading && glucoseData.length ? 
        <div className="App">
          <Nav selectedDates={selectedDates} setSelectedDates={setSelectedDates} glucoseData={glucoseData}/>
          <Graph selectedDates={selectedDates} glucoseData={glucoseData} glucoseRangeTuples={glucoseRangeTuples} />
          <>
          {hasNextPage && (
            <button
              id="LoadMoreBtn"
              disabled={networkStatusLoading}
              onClick={() =>
                fetchMore({
                  variables: {
                    first,
                    after: data.data.pageInfo.endCursor,
                  },
                })
              }
            >
              load more
            </button>
          )}
          </>
        </div>
      : 
        <h1 id="Loading">
          Loading...
        </h1>
      }
    </>
  );
}

export default App;