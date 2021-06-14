import React, { useEffect, useState } from "react";
import './App.css';
import axios from "axios";
import moment from "moment";
import Nav from "./components/Nav";
import Graph from "./components/Graph";

function App() {

  const [glucoseData, setGlucoseData] = useState([])
  const [glucoseRanges, setGlucoseRanges] = useState([])
  const [selectedDates, setSelectedDates] = useState({
    start: "",
    end: ""
  })

  // Fetch glucose data on app mount, and set initial state
  useEffect(()=> {
    axios.get(`https://caiken.dev.transformativemed.com/david-skills-test/data.php`)
      .then(res => {
        let data = res.data
        setGlucoseData(data.glucose_data)
        setGlucoseRanges(data.glucose_ranges)
        let startDT = data.glucose_data[0].result_dt_tm
        let startD = moment(startDT.slice(0, startDT.search(" "))).format()
        let endDT = data.glucose_data[data.glucose_data.length - 1].result_dt_tm
        let endD = moment(endDT.slice(0, endDT.search(" "))).format()
        setSelectedDates({
          start: startD,
          end: endD
        })
      })
  }, [])

  return (
    <>
      {glucoseData.length ? 
        <div className="App">
          <Nav selectedDates={selectedDates} setSelectedDates={setSelectedDates} glucoseData={glucoseData}/>
          <Graph selectedDates={selectedDates} glucoseData={glucoseData} glucoseRanges={glucoseRanges}/>
        </div>
      : 
      <h1 id="Loading">
        Loading...
      </h1>}
    </>
  );
}

export default App;