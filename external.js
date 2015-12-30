var svg;
var intervall = 1000;

//needed for timestamp format
Number.prototype.padLeft = function(base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
}

//generates current timestamp as string YYYY-MM-DD HH:MM:SS
function getCurrentTimpestamp() {
    var curD = new Date;
    var dformat = [curD.getFullYear(), (curD.getMonth() + 1).padLeft(),
            curD.getDate().padLeft()
        ].join('-') + ' ' +
        [curD.getHours().padLeft(),
            curD.getMinutes().padLeft(),
            curD.getSeconds().padLeft()
        ].join(':');
    return dformat;
}

var data = [];

//gets data from webservice expects json to be like { "temp": 42.0 }
function getTempFromAJAX() {
    var request = $.ajax({
        url: "/temp",
        method: "POST",
        dataType: "json"
    });

    request.done(function(msg) {

        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse

        if (data.length == 0) {
            data = []
        }


        var toBeAppended = {
            date: parseDate(getCurrentTimpestamp()),
            temp: msg.temp
        }

        data.push(toBeAppended);

        var margin = {
                top: 50,
                right: 20,
                bottom: 30,
                left: 60
            },
            width = 1000 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .domain([data[0].date, parseDate(getCurrentTimpestamp())])
            .range([0, width])
            .nice(d3.time.second);

        var y = d3.scale.linear()
            .range([height, 0]);


        console.log([data[0].date, parseDate(getCurrentTimpestamp())]);


        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            //.tickFormat("%I:%M:%S");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) {
                return x(d.date);
            })
            .y(function(d) {
                return y(d.temp);
            }).interpolate("basis");


        $("body").find("svg").html("").attr("align", "center");


        var svg = d3.select("#visualisation").data(data)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        y.domain([d3.min(data, function(d) {
            return d.temp;
        }) - 0.5, d3.max(data, function(d) {
            return d.temp;
        }) + 0.5]);

        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("text-decoration", "bold")
            .text("Derzeitige Temperatur: " + msg.temp);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Grad Celsius");

        svg.append("svg:path")
            .attr('stroke', 'green')
            .attr('stroke-width', 5)
            .attr('fill', 'none')
            .attr("class", "line")
            .attr("d", line(data));

        svg.selectAll(".xaxis text") // select all the text elements for the xaxis
            .attr("transform", function(d) {
                return "translate(" + this.getBBox().height * -2 + "," + this.getBBox().height + ")rotate(-45)";
            });

    });

    request.fail(function(jqXHR, textStatus) {
        console.warn("Request failed: " + textStatus);
    });
}

// we will load jquery and d3js and run our scripts after them
(function() {

    // Load d3
    var script_d3 = document.createElement("SCRIPT");
    script_d3.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.12/d3.js';
    script_d3.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script_d3);

    // Load Jquery
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);



    // Poll for jQuery to come into existance
    var checkReady = function(callback) {


        if (window.jQuery) {
            callback(jQuery);
        } else {
            window.setTimeout(function() {
                checkReady(callback);
            }, 100);
        }
    };
    // Start polling...
    checkReady(function($) {

        var intervalID = setInterval(function() {
            getTempFromAJAX()
        }, intervall);

        $("body").css({
            "background-color": "#e06c1f",
            "background-image": "url('')",
            "background-repeat": "no-repeat",
            "background-position": "top left",
            "background-attachment": "fixed"
        });

        $("body").append('<svg id="visualisation" width="1000" height="500"></svg>');

        $("svg").css({
            "background-color": "#ffffff",
            "margin-left": "auto",
            "margin-right": "auto",
            "display": "block",
            "margin-top": "1em"
        });

    });
})();
