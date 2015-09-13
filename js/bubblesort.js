(function ($) {
  Drupal.behaviors.bubblesort = {
    attach: function (context, settings) {

        base_path = Drupal.settings.basePath;
        var x, i, j, interval, values = null;
        var stop = false;

        // Load bar chart
        $(document).ready(function () {
            var empty = emptyForm();
            values = '';
            values = (!empty) ? $('form input:text').serialize() : '';
            bubblesort_ajax(values);
        });

        // Kill recursive function on shuffle
        $('#edit-submit-shuffle').click(function () {
            stop = true;
        });

        // Send form inputs for server-side processing
        function bubblesort_ajax(formvalues) {
            $.ajax({
                url: base_path + 'bubblesort/json/' + formvalues,
                cache: false,
                success: function (data) {
                    bubblesort_display(data);
                }
            });
        }

        // Initial display of bar chart on page load or shuffle
        function bubblesort_display(data) {

            x = d3.scale.linear()
                .domain([0, d3.max(data)])
                .range([0, 420]);

            d3.select(".chart")
                .selectAll("div")
                .data(data)
                .enter().append("div")
                .attr("class", "unsorted")
                .style("width", function (d) {
                    return x(d) + "px";
                })
                .text(function (d) {
                    return d;
                });
        }

        $('#edit-step-button').click(function() {
            process_sort();
        });

        $('#edit-play-button').click(function () {
            interval = setInterval(stepClick,1000);
        });

        // Sorting function for step button
        function process_sort() {
            var data = [];
            var sorted = 0;
            var unsorted = 0;
            var all = $('.chart > div');

            all.each(function () {
                if ($(this).hasClass("unsorted")) {
                    unsorted++;
                    data.push($(this).text());
                }
                if ($(this).hasClass("sorted")) {
                    sorted++;
                }
            });

            var total = data.length;

            if (total == sorted) {
                $('#edit-step-button').hide();
                $('#edit-play-button').hide();
                stop = true;
                return;
            }

            var indexToRemove = 0;
            var numberToRemove = 2;

            if (sorted > 0) {
                all.each(function (index) {
                    if (!$(this).hasClass("sorted")) {
                        numberToRemove = index + 1;
                        return false;
                    }
                });
            }

            var newdata = data.splice(indexToRemove, numberToRemove);

            newdata.sort(function(a, b){
                return b - a;
            });

            data = $.merge( newdata, data );

            j = d3.scale.linear()
                .domain([0, d3.max(data)])
                .range([0, 420]);

            d3.select(".chart").selectAll(".unsorted")
                .data(data)
                .style("width", function (d) {
                    return j(d) + "px";
                })
                .text(function (d) {
                    return d;
                });

            var finalIndex = indexToRemove + numberToRemove;

            all.each(function (index) {
                if (index == indexToRemove) {
                    $(this).css('background-color', 'green').addClass('sorted');
                    return false;
                }
            });
            for (i = indexToRemove; i < finalIndex; i++) {
                $('.chart > div:eq('+i+')').css('background-color', 'green').addClass('sorted');
            }
        }

        // Recursive function for play button
        function stepClick() {
            if(stop) {
                return;
            } else {
                $('#edit-step-button').trigger("click");

                $('body').ajaxComplete(function () {
                    stepClick();
                });
            }
        }
        // Checks for empty form
        function emptyForm() {
            $('input[type="text"]').each(function () {
                empty = ($(this).val() == "") ? 1 : 0;
                if (!empty) {
                    return false;
                }
            });
            return empty;
        }
    }
  }
}(jQuery));
