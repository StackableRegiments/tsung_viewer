$(function(){
    var series = {};
    var filters = {};
    var alreadyPresented = {};
    var comparables = $("#comparables");
    var comparators = $("#comparators");
    var comparisons = $("#comparisons");
    var notGraphable = {label:true,visible:true};
    var ensure = function(data,key,value){
        key in data ? data[key].push(value) : data[key] = [value];
    };
    var correct = function(samples,label){
        var data = {};
        data.label = label;
        _.each(samples.stats,function(instant){
            _.each(instant.samples, function(sample){
                ensure(data,sample.name,{x:new Date(instant.timestamp * 1000),y:sample.value});
            });
        });
        return data;
    };
    var updateDisplay = function(){
        var visibleSeries = _.filter(series,"visible");
        _.each(filters,function(enabled,attribute){
            var id = "composite_"+attribute;
            if(enabled){
                if($("#"+id).length == 0){
                    $("<div />",{
                        id:id,
                        class:"comparison"
                    }).appendTo(comparisons);
                }
                var availableData = function(serie){
                    return serie[attribute];
                };
                var visibleData = _.filter(visibleSeries,availableData);
                if(visibleData.length > 0){
                    MG.data_graphic({
                        title:attribute,
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
    };
    var filter = function(container,label,action){
        if(label in notGraphable) return;
        if(label in alreadyPresented) return;
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
        alreadyPresented[label] = outer;
    };
    var updateControls = function(){
        _.each(_.sortBy(series,"label"),function(serie){
            filter(comparables,serie.label,function(){
                var s = series[serie.label];
                s.visible = !s.visible;
            });
            _.each(serie,function(v,attribute){
                if(!(attribute in filters)) filters[attribute] = false;
            });
        });
        _.each(filters,function(v,attribute){
            filter(comparators,attribute,function(){
                filters[attribute] = !filters[attribute];
            });
        });
    };
    var updateSeries = function(href){
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
                    var update = correct(JSON.parse(json),href);
                    update.visible = href in series ? series[href].visible : false;
                    series[href] = update;
                    updateControls();
                    updateDisplay();
                }
                catch(e){
                    console.log("parse failure",href,e);
                }
            }
        })
    };
    var pull = function(){
        $.ajax({
            url:"/logs",
            complete:function(){
                setTimeout(pull,5000);
            },
            success:function(resp){
                $(resp).find('a[href^="2016"]').map(function(i,a){
                    var href = $(a).attr("href");
                    if(href in series){
                        if(series[href].visible){
                            updateSeries(href);
                        }
                    }
                    else{
                        updateSeries(href);
                    }
                });
            }
        });
    };
    pull();
});
