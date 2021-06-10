import React from "react";
import './Graph.css';
import '../../jquery-loader';
import ReactFlot from 'react-flot';
import '../../../node_modules/react-flot/flot/jquery.flot.time.min';
import moment from 'moment';
import { createData } from './GraphUtils';

function Graph(props) {

    let glucoseDBD = {}

    for (let i = 0; i < props.glucoseData.length; i++) {
        let reading = props.glucoseData[i]
        let dT = reading.result_dt_tm
        let day = dT.slice(0,10)
        if (glucoseDBD[day] == undefined) {
            glucoseDBD[day] = [reading]
        } else {
            glucoseDBD[day].push(reading)
        }
    }

    let glucoseDBDArr = []

    for (let i = 0; i < Object.keys(glucoseDBD).length; i++) {
        let date = Object.keys(glucoseDBD)[i]
        glucoseDBDArr.push({
            date: date,
            result: glucoseDBD[date]
        })
    }

    glucoseDBDArr.reverse()

    let ticks = [[0,"00:00"]]

    for (let i = 2; i < 25; i = i + 2) {
        if (i < 10) {
            ticks.push([i, `0${i}:00`])
        } else {
            ticks.push([i, `${i}:00`]) 
        }
    }

    if (window.innerWidth < 725) {
        ticks = [[0,"00"]]
        for (let i = 2; i < 25; i = i + 2) {
            if (i < 10) {
                ticks.push([i, `0${i}`])
            } else {
                ticks.push([i, `${i}`]) 
            }
        }
    }

    const options = {
        xaxis: {
            min: 0, 
            max: 24, 
            mode: "time", 
            timeformat: "%H:%M",
            ticks: ticks
        }, 
        yaxis: {
            min: 0, 
            max: 700,
            ticks: [100, 180]
        },
        series: {
            lines: { show: true }
            // points: { show: true }
        }
    }

    return (
        <div id="Graphs">
            {
            props.selectedDates.start.length > 0 ?
                glucoseDBDArr.map((item) => {
                    let momentS = moment(props.selectedDates.start).format('L')
                    let momentE = moment(props.selectedDates.end).format('L')
                    if (item.date >= momentS && item.date <= momentE) {
                        let addClass = ""
                        if (momentS == momentE) {
                            addClass = "onlyChart"
                        } else if (momentS == item.date) {
                            addClass = "lastChart"
                        }
                        return (
                            <div 
                                key={`cc${item.date.replaceAll('/', '')}`}
                                className={`ChartContainer ${addClass}`}
                            >
                                <h5 
                                    key={`cd${item.date.replaceAll('/', '')}`}
                                    className="ChartDate"
                                >
                                    {item.date}
                                </h5>
                                <ReactFlot 
                                    key={`rf${item.date.replaceAll('/', '')}`}
                                    id={`${item.date.replaceAll('/', '')}`} 
                                    className="FlotChart"
                                    data={createData(item, props)} 
                                    options={options} 
                                    width="100%" 
                                    height="250px" 
                                />
                            </div>
                        )

                    }
                })
            : " "
            }
        </div>
    );
}

export default Graph;