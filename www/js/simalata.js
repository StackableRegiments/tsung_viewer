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
                    console.log(resp);
                    $(resp).find('a[href^="2016"]').map(function(i,a){
                        var href = $(a).attr("href");
                        $.ajax({
                            url:"/logs/"+href+"/tsung.log",
                            success:function(json){
                                json = json.replace(/\s/g,"");
                                var close = "]}]}";
                                if(_.endsWith(json,",")){
                                    json =_.dropRight(json,1) + close;
                                }
                                if(!(_.endsWith(json,close))) {
                                    json += close;
                                }
                                try{
                                    aggregator[href] = JSON.parse(json);
                                    onAggregate(aggregator);
                                }
                                catch(e){
                                    console.log("parse failure",json);
                                }
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
                var visibleSeries = _.filter(series,"visible");
                _.each(filters,function(enabled,filter){
                    var id = "composite_"+filter;
                    if(enabled){
                        if($("#"+id).length == 0){
                            $("<div />",{
                                id:id,
                                class:"comparison"
                            }).appendTo(comparisons);
                        }
                        var availableData = function(serie){
                            return serie[filter];
                        };
                        var visibleData = _.filter(visibleSeries,availableData);
                        if(visibleData.length > 0){
                            MG.data_graphic({
                                title:filter,
                                data:_.map(visibleData,availableData),
                                height: 150,
                                target: '#'+id,
                                x_accessor: 'x',
                                y_accessor: 'y',
                                interpolate:"monotone"
                            });
                        }
                    }
                });
            }
            var excluded = {label:true};
            var filter = function(container,label,action){
                if(label in excluded) return;
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
            _.each(_.sortBy(series,"label"),function(serie){
                _.map(serie,function(data,attribute){
                    filters[attribute] = false;
                });
                filter(comparables,serie.label,function(){
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
