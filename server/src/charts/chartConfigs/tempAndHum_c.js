

module.exports=(chartData)=>{


    var config = {
        type: 'line',
        data: {
            labels: chartData.temp.labels,
            datasets: [{
                label: 'Temp',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: chartData.temp.data,
                fill: "start",
                yAxisID: 'y-axis-1'
            }, {
                label: 'Humidity',
                fill: "start",
                backgroundColor: 'rgba(75, 192, 192,0.5)',
                borderColor: 'rgba(75, 192, 192,1)',
                data: chartData.hum.data,
                yAxisID: 'y-axis-2'
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
                        labelString: 'Temp (°C)'
                    },
                    ticks:{
                        min:0,
                        max:70,
                        stepSize: 5
                    }
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Humidity (%)'
                    },
                    ticks:{
                        min:10,
                        max:80,
                        stepSize: 5
                    }
                }]
            }
        }
    };


    return config;


};