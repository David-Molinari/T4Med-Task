import $ from "jquery";
import { hexToRgbA } from '../../Utils';

// Create data series for the day's flot graph
export function createData(item, props, setModal) {
    
    // Create initial data array of objects, including
    // ranges accompanied by readings in each range
    let data = []
    for (let i = 0; i < props.glucoseRanges.length; i++) {
        let dataObj = {
            range: props.glucoseRanges[i].slice(0,2),
            data: []
        }
        data.push(dataObj)
    }

    for (let i0 = 0; i0 < item.result.length; i0++) {
        for (let i1 = 0; i1 < data.length; i1++) {
            let gL = item.result[i0].glucose_level
            if (gL >= data[i1].range[0] && gL <= data[i1].range[1]) {
                let hour = parseInt(item.result[i0].result_dt_tm.slice(11,13))
                let min = parseInt(item.result[i0].result_dt_tm.slice(14,16))
                let minDec = min/60
                let time = hour + minDec
                data[i1].data.push([time, gL])
            }
        }
    }

    // Build array of arrays containing only each 
    // reading's time and glucose level
    let TandGL = []
    for (let i = 0; i < data.length; i++) {
        if (data[i].data.length != undefined) {
            data[i].data.forEach((arr) => {
                TandGL.push(arr)
            })
        }
    }

    TandGL.sort((a, b) => {
        return a[0] - b[0]
    })

    // Build array holding all ranges' thresholds
    let thresholds = []
    for (let i = 0; i < props.glucoseRanges.length; i++) {
        thresholds.push(props.glucoseRanges[i][0])
        thresholds.push(props.glucoseRanges[i][1])
    }

    // Begin creating data series to pass to flot graphs
    // (the points to plot lines between)
    let seriesArr = []
    for (let i0 = 0; i0 < TandGL.length - 1; i0++) {
        // Functionality for assending glucose levels between readings
        if (TandGL.length > 0 && TandGL[i0][1] < TandGL[i0+1][1]) {
            // Except on the inital loop, add to the end of
            // the series array the last point and the current one
            // (to create next points to draw line between)
            if (seriesArr.length > 0) {
                seriesArr.push([
                    seriesArr[seriesArr.length-1][1],
                    TandGL[i0]
                ])
            }
            // Track number of threshold passes between adjecent readings
            // (to add points at threshold passes, to allow for different
            // colors of plot lines in between glucose readings)
            let thresholdPasses = []
            for (let i1 = 0; i1 < thresholds.length; i1++) {
                if (TandGL[i0][1] < thresholds[i1] && 
                    TandGL[i0+1][1] > thresholds[i1]) {
                    thresholdPasses.push(thresholds[i1])
                }
            }
            // Add current time and glucose level 
            // to array that holds next series to pass
            // to the array holding all series
            let currentSeries = [TandGL[i0]]
            // Get points and time gap between series
            // (to be able to calculate times thresholds
            // were passed, if glucose levels changed linearly)
            let totalTimeGap = TandGL[i0+1][0] - TandGL[i0][0]
            let totalPointsGap = TandGL[i0+1][1] - TandGL[i0][1]
            // Loop through threshold passes to plot points
            // for threshold passes between glucose readings
            // (to allow line colors to match ranges)
            for (let i2 = 0; i2 < thresholdPasses.length; i2++) {
                let pointsDif = thresholdPasses[i2] - TandGL[i0][1]
                let percOfTot = pointsDif/totalPointsGap
                let timeToAdd = percOfTot * totalTimeGap 
                let time = timeToAdd + TandGL[i0][0]
                // Add to the temp series to be pushed to all series,
                // the time that each threshold was passed
                currentSeries.push([time, thresholdPasses[i2]])
                // If on last threshold pass, push next
                // time and glucose reading to temp series
                if (i2 == thresholdPasses.length - 1) {
                    currentSeries.push(TandGL[i0+1])
                }
                // If the temp series has 2 points,
                // push to the series array and empty
                if (currentSeries.length == 2) {
                    seriesArr.push(currentSeries)
                    currentSeries = []
                }
            }
            // If no threshold passes, push to the series array
            // the current and next times and glucose readings
            // (because no points for color changes are needed)
            if (thresholdPasses.length == 0) {
                currentSeries.push(TandGL[i0+1])
                seriesArr.push(currentSeries)
            }
        // Functionality for decreasing glucose levels between readings
        } else if (TandGL.length > 0 && TandGL[i0][1] > TandGL[i0+1][1]) {
            // Except on the inital loop, add to the end of the array
            // holding all series - the last point and the current one
            // (to create next points to draw line between)
            if (seriesArr.length > 0) {
                seriesArr.push([
                    seriesArr[seriesArr.length-1][1],
                    TandGL[i0]
                ])
            }
            // Track number of threshold passes between adjecent readings
            // (to add points at threshold passes, to allow for different
            // colors of plot lines in between glucose readings)
            let thresholdPasses = []
            for (let i1 = 0; i1 < thresholds.length; i1++) {
                if (TandGL[i0+1][1] < thresholds[i1] && 
                    TandGL[i0][1] > thresholds[i1]) {
                    thresholdPasses.push(thresholds[i1])
                }
            }
            thresholdPasses.reverse()
            // Add current time and glucose level 
            // to array that holds next series to pass
            // to the array holding all series
            let currentSeries = [TandGL[i0]]
            // Get points and time gap between series
            // (to be able to calculate times thresholds
            // were passed, if glucose levels changed linearly)
            let totalTimeGap = TandGL[i0][0] - TandGL[i0+1][0]
            let totalPointsGap = TandGL[i0+1][1] - TandGL[i0][1]
            // Loop through threshold passes to plot points
            // for threshold passes between glucose readings
            // (to allow line colors to match ranges)
            for (let i2 = 0; i2 < thresholdPasses.length; i2++) {
                let pointsDif = TandGL[i0][1] - thresholdPasses[i2]
                let percOfTot = pointsDif/totalPointsGap
                let timeToAdd = percOfTot * totalTimeGap 
                let time = timeToAdd + TandGL[i0][0]
                // Add to the temp series to be pushed to all series,
                // the time that each threshold was passed
                currentSeries.push([time, thresholdPasses[i2]])
                // If on last threshold pass, push next
                // time and glucose reading to temp series
                if (i2 == thresholdPasses.length - 1 ) {
                    currentSeries.push(TandGL[i0+1])
                }
                // If the temp series has 2 points,
                // push to the series array and empty
                if (currentSeries.length == 2) {
                    seriesArr.push(currentSeries)
                    currentSeries = []
                }
            }
            // If no threshold passes, push to the series array
            // the current and next times and glucose readings
            // (because no points for color changes are needed)
            if (thresholdPasses.length == 0) {
                currentSeries.push(TandGL[i0+1])
                seriesArr.push(currentSeries)
            }
        }
    }

    // Add appropriate color for each data series,
    // and push to new array hold all series
    let dataPreSend = []
    for (let i0 = 0; i0 < seriesArr.length; i0++) {
        let avg = (seriesArr[i0][0][1] + seriesArr[i0][1][1])/2
        let color
        for (let i1 = 0; i1 < props.glucoseRanges.length; i1++) {
            if (avg > props.glucoseRanges[i1][0] &&
                avg < props.glucoseRanges[i1][1]) {
                color = props.glucoseRanges[i1][2]
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
    // (default functionality is data points do not show,
    // because many points are only for line color changes;
    // so actual glucose readings need seperate data series 
    // created for them, and then those series for actual 
    // points need to be added between data series arrays
    // that are for plotting lines between glucose readings)
    let dataToSend = []
    // Loop through array of all series (with range colors)
    for (let i0 = 0; i0 < dataPreSend.length; i0++) {
        let firstT = dataPreSend[i0].data[0][0]
        let firstGl = dataPreSend[i0].data[0][1]
        let color = dataPreSend[i0].color
        let dataToPush = []
        let fAndOrL = "0"
        // Loop through actual glucose readings, and
        // see if current array in the array of all series
        // contains 0, 1, or 2 actual glucose readings
        for (let i1 = 0; i1 < TandGL.length; i1++) {
            let TandGL0 = TandGL[i1][0]
            let TandGL1 = TandGL[i1][1]
            let fillColor = color
            if (color != undefined) {
                fillColor = color.slice(0, color.indexOf(")") - 3)+"1)"
            }
            // If the first item in the loop of the previous 
            // array of all series data's first glucose reading
            // is equal to the current time and glucose reading
            // in the loop of actual time and glucose readings,
            // push the data point to the next all series array,
            // and track that the first item in the loop of the 
            // prev. array of all series data is an actual reading
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
            // If the second item in the loop of the previous 
            // array of all series data's first glucose reading
            // is equal to the current time and glucose reading
            // in the loop of actual time and glucose readings,
            // push the data point to the next all series array,
            // and update tracking of which data points of current
            // item of prev. array of all series data is/are
            // actual glucose readings
            let secondT = dataPreSend[i0].data[1][0]
            let secondGl = dataPreSend[i0].data[1][1]
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
        // If neither time and glucose level are
        // actual glucose readings, push the pair 
        // to the new array of all series data
        if (fAndOrL == "0") {
            dataToSend.push(dataPreSend[i0])
        } 
        // If just the first time and glucose level
        // from the current item from the
        // previouse array of all series data
        // is an actual glucose reading, push the
        // actual glucose reading data point,
        // the then the current item from the
        // previous array of all series data
        else if (fAndOrL == "1") {
            dataToSend.push(dataToPush[0])
            dataToSend.push(dataPreSend[i0])
        } 
        // If just the second time and glucose level
        // from the current item from the previous array 
        // of all series data is an actual glucose reading, 
        // push the current item from the previous array 
        // of all series data, then the current item 
        // from the previous array of all series data
        else if (fAndOrL == "2") {
            dataToSend.push(dataPreSend[i0])
            dataToSend.push(dataToPush[0])
        } 
        // If both time and glucose levels
        // from the current item from the
        // previous array of all series data
        // are actual glucose readings, push the
        // actual glucose reading data points,
        // and between them, the current item from 
        // the previous array of all series data
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
        let d0 = dataToSend[i0].data
        let d1 = dataToSend[i0+1].data
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
                        let num = ((d1[0][0] - d0[1][0]) / 2)
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
    let item0 = item
    $(`#${item0.date.replaceAll('/', '')}`).off('plotclick')
        .on('plotclick', function (event, pos, item) {
        event.stopPropagation()
        if (item != null && item.datapoint) {
            for (let i = 0; i < item0.result.length; i++) {
                let result = item0.result[i]
                let gL = result.glucose_level
                let hour = parseInt(result.result_dt_tm.slice(11,13))
                let min = parseInt(result.result_dt_tm.slice(14,16))
                let minDec = min/60
                let time = hour + minDec
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