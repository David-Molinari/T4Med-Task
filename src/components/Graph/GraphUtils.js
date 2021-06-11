import $ from "jquery";

export function createData(item, props, setModal) {
    
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

    let thresholds = []

    for (let i = 0; i < props.glucoseRanges.length; i++) {
        thresholds.push(props.glucoseRanges[i][0])
        thresholds.push(props.glucoseRanges[i][1])
    }

    let seriesArr = []

    // Creating data series
    for (let i0 = 0; i0 < TandGL.length - 1; i0++) {
        if (TandGL.length > 0 && TandGL[i0][1] < TandGL[i0+1][1]) {
            let thresholdPasses = []
            for (let i1 = 0; i1 < thresholds.length; i1++) {
                if (TandGL[i0][1] < thresholds[i1] && 
                    TandGL[i0+1][1] > thresholds[i1]) {
                    thresholdPasses.push(thresholds[i1])
                }
            }
            if (seriesArr.length > 0) {
                seriesArr.push([
                    seriesArr[seriesArr.length-1][1],
                    TandGL[i0]
                ])
            }
            let currentSeries = [TandGL[i0]]
            let totalTimeGap = TandGL[i0+1][0] - TandGL[i0][0]
            let totalPointsGap = TandGL[i0+1][1] - TandGL[i0][1]
            for (let i2 = 0; i2 < thresholdPasses.length; i2++) {
                let pointsDif = thresholdPasses[i2] - TandGL[i0][1]
                let percOfTot = pointsDif/totalPointsGap
                let timeToAdd = percOfTot * totalTimeGap 
                let time = timeToAdd + TandGL[i0][0]
                currentSeries.push([time, thresholdPasses[i2]])
                if (i2 == thresholdPasses.length - 1 ) {
                    currentSeries.push(TandGL[i0+1])
                }
                if (currentSeries.length == 2) {
                    seriesArr.push(currentSeries)
                    currentSeries = []
                }
            }
            if (thresholdPasses.length == 0) {
                currentSeries.push(TandGL[i0+1])
                seriesArr.push(currentSeries)
            }
        } else if (TandGL.length > 0 && TandGL[i0][1] > TandGL[i0+1][1]) {
            let thresholdPasses = []
            for (let i1 = 0; i1 < thresholds.length; i1++) {
                if (TandGL[i0+1][1] < thresholds[i1] && 
                    TandGL[i0][1] > thresholds[i1]) {
                    thresholdPasses.push(thresholds[i1])
                }
            }
            if (seriesArr.length > 0) {
                seriesArr.push([
                    seriesArr[seriesArr.length-1][1],
                    TandGL[i0]
                ])
            }
            thresholdPasses.reverse()
            let currentSeries = [TandGL[i0]]
            let totalTimeGap = TandGL[i0][0] - TandGL[i0+1][0]
            let totalPointsGap = TandGL[i0+1][1] - TandGL[i0][1]
            for (let i2 = 0; i2 < thresholdPasses.length; i2++) {
                let pointsDif = TandGL[i0][1] - thresholdPasses[i2]
                let percOfTot = pointsDif/totalPointsGap
                let timeToAdd = percOfTot * totalTimeGap 
                let time = timeToAdd + TandGL[i0][0]
                currentSeries.push([time, thresholdPasses[i2]])
                if (i2 == thresholdPasses.length - 1 ) {
                    currentSeries.push(TandGL[i0+1])
                }
                if (currentSeries.length == 2) {
                    seriesArr.push(currentSeries)
                    currentSeries = []
                }
            }
            if (thresholdPasses.length == 0) {
                currentSeries.push(TandGL[i0+1])
                seriesArr.push(currentSeries)
            }
        }
    }

    let dataPreSend = []

    // Adding colors
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
            color: color
        })
    }

    let dataToSend = []

    // Adding points
    for (let i0 = 0; i0 < dataPreSend.length; i0++) {
        let firstT = dataPreSend[i0].data[0][0]
        let firstGl = dataPreSend[i0].data[0][1]
        let color = dataPreSend[i0].color
        let dataToPush = []
        let fAndOrL = "0"
        for (let i1 = 0; i1 < TandGL.length; i1++) {
            let TandGL0 = TandGL[i1][0]
            let TandGL1 = TandGL[i1][1]
            if (firstT == TandGL0 && firstGl == TandGL1) {
                dataToPush.push({
                    data: [[firstT, firstGl]],
                    color: color,
                    points: {show: true, radius: 7}
                })
                fAndOrL = "1"
            }
            let secondT = dataPreSend[i0].data[1][0]
            let secondGl = dataPreSend[i0].data[1][1]
            if (secondT == TandGL0 && secondGl == TandGL1) {
                dataToPush.push({
                    data: [[secondT, secondGl]],
                    color: color,
                    points: {show: true, radius: 7}
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
        } else if (fAndOrL == "1") {
            dataToSend.push(dataToPush[0])
            dataToSend.push(dataPreSend[i0])
        } else if (fAndOrL == "2") {
            dataToSend.push(dataPreSend[i0])
            dataToSend.push(dataToPush[0])
        } else {
            dataToSend.push(dataToPush[0])
            dataToSend.push(dataPreSend[i0])
            dataToSend.push(dataToPush[1])
        }
    }

    // Closing gaps
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