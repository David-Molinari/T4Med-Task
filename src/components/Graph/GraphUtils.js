export function createData(item, props) {
    let data = []

    for (let i = 0; i < props.glucoseRanges.length; i++) {
        let dataObj = {
            range: props.glucoseRanges[i].slice(0,2),
            data: [],
            color: props.glucoseRanges[i][2],
            series: {
                lines: { 
                    show: true, 
                    fill: true, 
                    fillColor: {
                        colors: [{ opacity: 1 }, { opacity: 1 } ]
                    }
                }
            }
        }
        data.push(dataObj)
    }

    for (let i0 = 0; i0 < item.result.length; i0++) {
        for (let i1 = 0; i1 < data.length; i1++) {
            let gL = item.result[i0].glucose_level
            if (gL >= data[i1].range[0] && gL <= data[i1].range[1]) {
                let time = parseInt(item.result[i0].result_dt_tm.slice(11,13))
                data[i1].data.push([time, gL])
            }
        }
    }

    let TandGL = []

    for (let i = 0; i< data.length; i++) {
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

    let dataToSend = []

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
        dataToSend.push({
            data: seriesArr[i0],
            color: color,
            series: {
                lines: {
                    show: true, 
                    fill: true, 
                    fillColor: {
                        colors: [{ opacity: 1 }, { opacity: 1 } ]
                    }
                }
            } 
        })
    }

    return dataToSend
}