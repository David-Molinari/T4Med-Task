import { useState, useEffect } from "react";
import './Graph.css';
import '../../jquery-loader';
import ReactFlot from 'react-flot';
import '../../../node_modules/react-flot/flot/jquery.flot.time.min';
import moment from 'moment';
import { createData } from './GraphUtils';
import ModalComp from '../Modal';

interface ISelectedDates {
    start: string,
    end: string
}

interface IData {
    _id: string,
    result_id: string,
    result_dt_tm: string,
    glucose_level: number,
    glucose_level_unit: string,
    source: string
}

type RangeTuple = [number, number, string]

interface IModal {
    open: boolean;
    data: {
        glucoseLevelNum?: number,
        glucoseLevel: number | string,
        resultDate: string,
        source: string,
        resultId: string
    };
}

interface IProps {
    selectedDates: ISelectedDates,
    glucoseData: IData[],
    glucoseRangeTuples: RangeTuple[]
}

interface IItem {
    date: string, 
    result: IData[]
}

interface IOptions {
    xaxis: {
        min: number,
        max: number,
        mode: string,
        timeformat: string,
        ticks: [number, string][]
    },
    yaxis: {
        min: number,
        max: number,
        ticks: number[],
    },
    series: {
        lines: {
            show: boolean,
            lineWidth: number,
        }
    },
    grid: {
        clickable: boolean,
        autoHighlight: boolean
    }
}

function Graph(props: IProps): JSX.Element {

    const [modal, setModal] = useState<IModal>({
        open: false,
        data: {
            glucoseLevel: 0,
            resultDate: "",
            source: "",
            resultId: ""
        }
    })

    // On date change, update DOM on delay
    // to allow plotclick to attach
    const [ready, setReady] = useState(false)
    useEffect(()=> {
        setTimeout(()=> {
            setReady(false)
            setReady(true)
        }, 100)
    }, [props.selectedDates])

    console.log(ready)

    // Build object of glucose readings by day
    let glucoseDBD: {[key: string]: IData[]} = {}
    for (let i = 0; i < props.glucoseData.length; i++) {
        let reading: IData = props.glucoseData[i]
        let dT: string = reading.result_dt_tm
        let day: string = dT.slice(0,10)
        if (glucoseDBD[day] == undefined) {
            glucoseDBD[day] = [reading]
        } else {
            glucoseDBD[day].push(reading)
        }
    }

    // Build array of glucose readings by day
    let glucoseDBDArr: {date: string, result: IData[]}[] = []
    for (let i = 0; i < Object.keys(glucoseDBD).length; i++) {
        let date: string = Object.keys(glucoseDBD)[i]
        glucoseDBDArr.push({
            date: date,
            result: glucoseDBD[date]
        })
    }
    glucoseDBDArr.reverse()

    // Format x-axis ticks
    let ticks: [number, string][] = [[0,"00:00"]]
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

    // Define options for flot graphs
    const options: IOptions = {
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
            lines: { 
                show: true, 
                lineWidth: 5 
            }
        },
        grid: {
            clickable: true,
            autoHighlight: false
        }
    }

    return (
        <div id="Graphs">
            {
            // Map graphs in range of selected dates
            props.selectedDates.start.length > 0 ?
                glucoseDBDArr.map((item: IItem): void | JSX.Element => {
                    let momentS: string = moment(props.selectedDates.start).format('L')
                    let momentE: string = moment(props.selectedDates.end).format('L')
                    // Add special classes to first and last chart for styling
                    if (item.date >= momentS && item.date <= momentE) {
                        let addClass: string = ""
                        if (momentS == momentE) {
                            addClass = "onlyChart"
                        } else if (momentS == item.date) {
                            addClass = "lastChart"
                        }
                        return (
                            <div 
                                key={`cc${item.date.split('/').join('')}`}
                                className={`ChartContainer ${addClass}`}
                            >
                                <h5 
                                    key={`cd${item.date.split('/').join('')}`}
                                    className="ChartDate"
                                >
                                    {item.date}
                                </h5>
                                <ReactFlot
                                    key={`rf${item.date.split('/').join('')}`}
                                    id={`${item.date.split('/').join('')}`} 
                                    className="FlotChart"
                                    data={createData(item, props, setModal)} 
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
            <ModalComp
                modal={modal} 
                setModal={setModal}
                glucoseRangeTuples={props.glucoseRangeTuples}
            />
        </div>
    );
}

export default Graph;