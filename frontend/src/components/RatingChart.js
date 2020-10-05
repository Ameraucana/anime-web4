import React, { useRef, useEffect } from "react";
import Chart from "chart.js";
import "chartjs-plugin-datalabels";


export default (props) => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        const context = canvasRef.current.getContext("2d");

        // I don't want to disable it for both axes manually,
        // so I made it default
        Chart.helpers.merge(Chart.defaults.scale.gridLines, {
            display: false,
            drawBorder: false
        });
        

        new Chart(context, {
            type: "bar",
            data: {
                // these are the numbers on the bottom.
                // I don't know if a rating is listed if
                // its amount property is zero, so I played
                // it safe.
                labels: props.scoreDist.map(rating => rating.score),
                datasets: [{
                    label: "ratings", 
                    data: props.scoreDist.map(rating => rating.amount),
                    backgroundColor: [
                        "#d2482d",
                        "#d2642d",
                        "#d2802d",
                        "#d29b2d",
                        "#d2b72d",
                        "#d2d22d",
                        "#b7d22d",
                        "#9bd22d",
                        "#80d22d",
                        "#64d22d"
                    ],
                }],
            },
            options:{
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            display: false,
                            beginAtZero: true
                        },
                        gridLines: {
                            tickMarkLength: 0
                        }
                    }]
                },
                title: {
                    text: `(average score ${props.meanScore})`,
                    display: true,
                    fontSize: 20,
                    padding: 15
                },
                layout: {
                    padding: {
                        top: -5,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                },
                plugins: {
                    datalabels: {
                        anchor: "end",
                        align: "top",
                        offset: -5,
                        display: "auto",
                        font: {
                            size: 15
                        }
                    }
                }
            }
        });
    })

    return (
        <canvas ref={canvasRef}/>
    );
}

