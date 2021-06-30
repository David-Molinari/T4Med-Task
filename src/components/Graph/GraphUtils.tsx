import { Dispatch } from "react";
import $ from "jquery";
import { hexToRgbA } from '../../Utils';
import { IData, IItem, ISelectedDates, RangeTuple, IModal } from '../../GlobalTypes';

type Props = {
    selectedDates: ISelectedDates,
    glucoseData: IData[],
    glucoseRangeTuples: RangeTuple[]
}

type TTandGL = [number, number]

interface IRandD {
    range: [number, number],
    data: TTandGL[]
}

type TSeries = [[number, number], [number, number]]

interface IDataPreSend {
    data: TSeries,
    color: string
}

type TDataPoint = number[][]

interface IDataToPush {
    data: TDataPoint,
    color: string,
    points?: {
        show: boolean;
        fill: boolean;
        radius: number;
        fillColor: string;
    }
}

// Create data series for the day's flot graph
export function createData(item: IItem, props: Props, setModal: Dispatch<IModal>) {
    
    // Create initial data array of objects, including
    // ranges accompanied by readings in each range
    let rAndD: IRandD[] = []
    for (let i = 0; i < props.glucoseRangeTuples.length; i++) {
        let dataObj: IRandD = {
            range: [props.glucoseRangeTuples[i][0],props.glucoseRangeTuples[i][1]],
            data: []
        }
        rAndD.push(dataObj)
    }

    for (let i0 = 0; i0 < item.result.length; i0++) {
        for (let i1 = 0; i1 < rAndD.length; i1++) {
            let gL: number = item.result[i0].glucose_level
            if (gL >= rAndD[i1].range[0] && gL <= rAndD[i1].range[1]) {
                let hour: number = parseInt(item.result[i0].result_dt_tm.slice(11,13))
                let min: number = parseInt(item.result[i0].result_dt_tm.slice(14,16))
                let minDec: number = min/60
                let time: number = hour + minDec
                rAndD[i1].data.push([time, gL])
            }
        }
    }

    // Build array of arrays containing only each 
    // reading's time and glucose level
    let TandGL: TTandGL[] = []
    for (let i = 0; i < rAndD.length; i++) {
        if (rAndD[i].data.length != undefined) {
            rAndD[i].data.forEach((arr) => {
                TandGL.push(arr)
            })
        }
    }

    TandGL.sort((a: TTandGL, b: TTandGL): number => {
        return a[0] - b[0]
    })

    // Build array holding all ranges' thresholds
    let thresholds: number[] = []
    for (let i = 0; i < props.glucoseRangeTuples.length; i++) {
        thresholds.push(props.glucoseRangeTuples[i][0])
        thresholds.push(props.glucoseRangeTuples[i][1])
    }

    // Begin creating data series to pass to flot graphs
    // (the points to plot lines between)
    let seriesArr: TSeries[] = []
    for (let i0 = 0; i0 < TandGL.length - 1; i0++) {
        // Functionality for assending glucose levels between readings
        if (TandGL.length > 0 && TandGL[i0][1] < TandGL[i0+1][1]) {
            if (seriesArr.length > 0) {
                seriesArr.push([
                    seriesArr[seriesArr.length-1][1],
                    TandGL[i0]
                ])
            }
            let thresholdPasses: number[] = []
            for (let i1 = 0; i1 < thresholds.length; i1++) {
                if (TandGL[i0][1] < thresholds[i1] && 
                    TandGL[i0+1][1] > thresholds[i1]) {
                    thresholdPasses.push(thresholds[i1])
                }
            }
            let currentTSeries: TTandGL[] = [TandGL[i0]]
            let totalTimeGap: number = TandGL[i0+1][0] - TandGL[i0][0]
            let totalPointsGap: number = TandGL[i0+1][1] - TandGL[i0][1]
            for (let i2 = 0; i2 < thresholdPasses.length; i2++) {
                let pointsDif: number = thresholdPasses[i2] - TandGL[i0][1]
                let percOfTot: number = pointsDif/totalPointsGap
                let timeToAdd: number = percOfTot * totalTimeGap 
                let time: number = timeToAdd + TandGL[i0][0]
                currentTSeries.push([time, thresholdPasses[i2]])
                if (i2 == thresholdPasses.length - 1) {
                    currentTSeries.push(TandGL[i0+1])
                }
                if (currentTSeries.length == 2) {
                    seriesArr.push([currentTSeries[0], currentTSeries[1]])
                    currentTSeries = []
                }
            }
            if (thresholdPasses.length == 0) {
                currentTSeries.push(TandGL[i0+1])
                seriesArr.push([currentTSeries[0], currentTSeries[1]])
            }
        // Functionality for decreasing glucose levels between readings
        } else if (TandGL.length > 0 && TandGL[i0][1] > TandGL[i0+1][1]) {
            if (seriesArr.length > 0) {
                seriesArr.push([
                    seriesArr[seriesArr.length-1][1],
                    TandGL[i0]
                ])
            }
            let thresholdPasses: number[] = []
            for (let i1 = 0; i1 < thresholds.length; i1++) {
                if (TandGL[i0+1][1] < thresholds[i1] && 
                    TandGL[i0][1] > thresholds[i1]) {
                    thresholdPasses.push(thresholds[i1])
                }
            }
            thresholdPasses.reverse()
            let currentTSeries: TTandGL[] = [TandGL[i0]]
            let totalTimeGap: number = TandGL[i0][0] - TandGL[i0+1][0]
            let totalPointsGap: number = TandGL[i0+1][1] - TandGL[i0][1]
            for (let i2 = 0; i2 < thresholdPasses.length; i2++) {
                let pointsDif: number = TandGL[i0][1] - thresholdPasses[i2]
                let percOfTot: number = pointsDif/totalPointsGap
                let timeToAdd: number = percOfTot * totalTimeGap 
                let time: number = timeToAdd + TandGL[i0][0]
                currentTSeries.push([time, thresholdPasses[i2]])
                if (i2 == thresholdPasses.length - 1 ) {
                    currentTSeries.push(TandGL[i0+1])
                }
                if (currentTSeries.length == 2) {
                    seriesArr.push([currentTSeries[0], currentTSeries[1]])
                    currentTSeries = []
                }
            }
            if (thresholdPasses.length == 0) {
                currentTSeries.push(TandGL[i0+1])
                seriesArr.push([currentTSeries[0], currentTSeries[1]])
            }
        }
    }

    // Add appropriate color for each data series,
    // and push to new array hold all series
    let dataPreSend: IDataPreSend[] = []
    for (let i0 = 0; i0 < seriesArr.length; i0++) {
        let avg: number = (seriesArr[i0][0][1] + seriesArr[i0][1][1])/2
        let color: string = "#fff"
        for (let i1 = 0; i1 < props.glucoseRangeTuples.length; i1++) {
            if (avg > props.glucoseRangeTuples[i1][0] &&
                avg < props.glucoseRangeTuples[i1][1]) {
                color = props.glucoseRangeTuples[i1][2]
                break
            }
        }
        dataPreSend.push({
            data: seriesArr[i0],
            color: hexToRgbA(color, .5)
        })
    }

    // Add showable data points for the plotted points
    // that are actual time and glucose readings
    let dataToSend: IDataToPush[] = []
    for (let i0 = 0; i0 < dataPreSend.length; i0++) {
        let firstT: number = dataPreSend[i0].data[0][0]
        let firstGl: number = dataPreSend[i0].data[0][1]
        let color: string = dataPreSend[i0].color
        let dataToPush: IDataToPush[] = []
        let fAndOrL: string = "0"
        for (let i1 = 0; i1 < TandGL.length; i1++) {
            let TandGL0: number = TandGL[i1][0]
            let TandGL1: number = TandGL[i1][1]
            let fillColor: string = color
            if (color != undefined) {
                fillColor = color.slice(0, color.indexOf(")") - 3)+"1)"
            }
            if (firstT == TandGL0 && firstGl == TandGL1) {
                dataToPush.push({
                    data: [[firstT, firstGl]],
                    color: color,
                    points: {
                        show: true,
                        fill: true,
                        radius: 7,
                        fillColor: fillColor
                    }
                })
                fAndOrL = "1"
            }
            let secondT: number = dataPreSend[i0].data[1][0]
            let secondGl: number = dataPreSend[i0].data[1][1]
            if (secondT == TandGL0 && secondGl == TandGL1) {
                dataToPush.push({
                    data: [[secondT, secondGl]],
                    color: color,
                    points: {
                        show: true,
                        fill: true,
                        radius: 7,
                        fillColor: fillColor
                    }
                })
                if (fAndOrL == "0") {
                    fAndOrL = "2"
                } else {
                    fAndOrL = "12"
                }
            }
        }
        if (fAndOrL == "0") {
            dataToSend.push(dataPreSend[i0])
        } 
        else if (fAndOrL == "1") {
            dataToSend.push(dataToPush[0])
            dataToSend.push(dataPreSend[i0])
        } 
        else if (fAndOrL == "2") {
            dataToSend.push(dataPreSend[i0])
            dataToSend.push(dataToPush[0])
        } 
        else {
            dataToSend.push(dataToPush[0])
            dataToSend.push(dataPreSend[i0])
            dataToSend.push(dataToPush[1])
        }
    }

    // This adjusts times for data series, to
    // eliminate gaps in time between adj. series, 
    // to avoid gaps in lines on the graph
    for (let i0 = 0; i0 < dataToSend.length - 1; i0++) {
        let d0: TDataPoint = dataToSend[i0].data
        let d1: TDataPoint = dataToSend[i0+1].data
        if (d0.length == 1 && d1.length == 1) {
            dataToSend.splice(i0, 1)
        } else {
            if (d0.length > 1 && d0[1][0] + .01 < d1[0][0]) {
                for (let i1 = 0; i1 < TandGL.length; i1++) {
                    if (d0[1][0] === TandGL[i1][0] && d0[1][1] === TandGL[i1][1]) {
                        d1[0][0] = d0[1][0]
                    } else if (d1[0][0] === TandGL[i1][0] && d1[0][1] === TandGL[i1][1]) {
                        d0[1][0] = d1[0][0]
                    } else {
                        let num: number = ((d1[0][0] - d0[1][0]) / 2)
                        d0[1][0] = d0[1][0] + num
                        d1[0][0] = d1[0][0] - num
                    }
                }
            }
        }
    }

    // Add the plotclick event listener to the graph
    // that updates the state variable "modal", to open
    // the modal with the appropriate point's data
    let item0: IItem = item
    $(`#${item0.date.split('/').join('')}`).off('plotclick')
        .on('plotclick', function (event, pos, item) {
        event.stopPropagation()
        if (pos != null && item != null && item.datapoint) {
            for (let i = 0; i < item0.result.length; i++) {
                let result: IData = item0.result[i]
                let gL: number = result.glucose_level
                let hour: number = parseInt(result.result_dt_tm.slice(11,13))
                let min: number = parseInt(result.result_dt_tm.slice(14,16))
                let minDec: number = min/60
                let time: number = hour + minDec
                if (item.datapoint[0] == time && item.datapoint[1] == gL) {
                    setModal({
                        open: true,
                        data: {
                            glucoseLevelNum: gL,
                            glucoseLevel: gL + result.glucose_level_unit,
                            resultDate: result.result_dt_tm,
                            source: result.source,
                            resultId: result.result_id
                        }
                    })
                    break
                }
            }
        }
    });

    return dataToSend

}