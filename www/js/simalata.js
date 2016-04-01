var Simalata = (function(){
    return {
        prime:function(pattern){
            pattern.sample({},function(entries){
                pattern.display(
                    pattern.transform(entries)
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
        transform:function(samples){
            var runs = {};
            _.map(samples,function(sample,label){
                var data = {};
                sample.stats.map(function(instant){
                    instant.samples.map(function(sample){
                        ensure(data,sample.name,{x:instant.timestamp,y:sample.value});
                    });
                });
                runs[label] = data;
            });
            return runs;
        },
        display:function(series){
            var comparables = $("#comparables").empty();
            var comparisons = $("#comparisons").empty();
            _.each(series,function(serie,label){
                $("<a />")
                    .append($("<h3 />",{
                        text:label,
                        class:"comparable"
                    }).click(function(){
                        comparisons.empty();
                        _.map(serie,function(sample,label){
                            var id = _.uniqueId("g");
                            $("<div />",{
                                id:id,
                                class:"comparison"
                            }).appendTo(comparisons);
                            MG.data_graphic({
                                title:label,
                                data:sample,
                                height: 150,
                                target: '#'+id,
                                x_accessor: 'x',
                                y_accessor: 'y'
                            });
                        });
                    })).appendTo(comparables);
            });
        }
    });
});
