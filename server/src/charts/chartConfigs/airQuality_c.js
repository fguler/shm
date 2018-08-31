

const calculateMinTick = (data) => {

    let sNum = data.sort()[0];
    let minValue = (sNum - 10);

    if (minValue <= 0) {
        minValue = sNum;
    }
    minValue = minValue % 2 == 0 ? minValue : minValue - 1;
    return minValue;
};


module.exports = (chartData) => {


    var config = {
        type: 'line',
        data: {
            labels: chartData.air.labels,
            datasets: [{
                fill: "start",
                label: 'Air Quality',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: chartData.air.data,
                yAxisID: 'y-axis-1'
            }]
        },
        options: {

            responsive: true,
            title: {
                display: true,
                text: chartData.chartName
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: chartData.labelDefinition
                    }
                }],
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                    scaleLabel: {
                        display: true,
                        labelString: 'Score (%)'
                    },
                    ticks: {
                        min: calculateMinTick(chartData.air.data),
                        max: 100,
                        stepSize: 2
                    }
                }]
            },
            plugins: {
                filler: {
                    propagate: true
                }
            }
        }
    };


    return config;


};