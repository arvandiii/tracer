
function renderChart(datasets) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var s1 = {
        label: 's1',
        borderColor: 'blue',
        data: [
            { x: 1580375886725376, y: 100 },
            { x: 1580375886726376, y: 101 },
        ]
    };

    var s2 = {
        "label": "ax-main-service-location-service",
        "data": [
            {
                "x": 1580384098183402,
                "y": 31420
            },
            {
                "x": 1580384099340573,
                "y": 35382
            },
            {
                "x": 1580384096863094,
                "y": 241035
            },
            {
                "x": 1580384101545459,
                "y": 28013
            },
            {
                "x": 1580384100483361,
                "y": 27575
            }
        ],
        "borderColor": "blue"
    }

    console.log('aaaa', datasets)

    var chart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            elements: {
                line: {
                    tension: 0
                }
            },
            bezierCurve: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'second'
                    }
                }]
            }
        }
    });
}

$("#renderBtn").click(
    function () {
        console.log('omade inja', $, $.get)
        $.get("http://localhost:4000", function ({ datasets }) {
            console.log('salam', datasets)
            renderChart(datasets)
        });

    }
);