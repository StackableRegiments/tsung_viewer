var Simalata = (function(){
    return {
        prime:function(pattern){
            pattern.sample({},function(entries){
                pattern.display(
                    pattern.correct(entries)
                );
            });
        }
    };
})();

$(function(){
    var ensure = function(data,key,value){
        key in data ? data[key].push(value) : data[key] = [value];
    };
    Simalata.prime({
        sample:function(aggregator,onAggregate){
            $.ajax({
                url:"/logs",
                success:function(resp){
                    $(resp).find('a[href^="2016"]').map(function(i,a){
                        var href = $(a).attr("href");
                        $.ajax({
                            url:"/logs/"+href+"/tsung.log",
                            success:function(json){
                                aggregator[href] = (JSON.parse(json));
                                onAggregate(aggregator);
                            }
                        });
                    });
                }
            });
        },
        correct:function(samples){
            var runs = {};
            _.map(samples,function(sample,label){
                var data = {};
                sample.stats.map(function(instant){
                    instant.samples.map(function(sample){
                        ensure(data,sample.name,{x:new Date(instant.timestamp * 1000),y:sample.value});
                    });
                });
                data.label = label;
                runs[label] = data;
            });
            return runs;
        },
        display:function(series){
            var comparables = $("#comparables").empty();
            var comparators = $("#comparators").empty();
            var comparisons = $("#comparisons").empty();
            var updateDisplay = function(){
                comparisons.empty();
                var visibleSeries = _.filter(series,"visible");
                _.each(filters,function(enabled,filter){
                    if(enabled){
                        var id = _.uniqueId("g");
                        $("<div />",{
                            id:id,
                            class:"comparison"
                        }).appendTo(comparisons);
                        MG.data_graphic({
                            title:filter,
                            data:_.map(visibleSeries,function(serie){return serie[filter]}),
                            height: 150,
                            target: '#'+id,
                            x_accessor: 'x',
                            y_accessor: 'y'
                        });
                    }
                });
            }
            var filter = function(container,label,action){
                var outer = $("<div />").appendTo(container);
                $("<input />",{
                    type:"checkbox"
                }).on("click",function(){
                    action();
                    updateDisplay();
                }).appendTo(outer);
                $("<label />",{
                    text:label
                }).appendTo(outer);
            }
            var filters = {};
            _.each(series,function(serie,label){
                _.map(serie,function(data,attribute){
                    filters[attribute] = false;
                });
                filter(comparables,label,function(){
                    serie.visible = !serie.visible;
                });
            });
            _.each(filters,function(v,attribute){
                filter(comparators,attribute,function(){
                    filters[attribute] = !filters[attribute];
                });
            });
        }
    });
});
