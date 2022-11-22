function FindPOIType() {
    var id = $("#poitypes").val();
    var poitype, pt = 0;
    do {
        if (cfg.poitypes[pt].id == id) {
            poitype = cfg.poitypes[pt];
        } else {
            pt++;
        }
    } while (pt < cfg.poitypes.length && !poitype);
    return cfg.poitypes[pt];
}
function gsNearestXML(typeName, point) {
    return "<?xml version='1.0' encoding='UTF-8'?><wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns='http://www.opengis.net/wps/1.0.0' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:ows='http://www.opengis.net/ows/1.1' xmlns:wcs='http://www.opengis.net/wcs/1.1.1' xmlns:wfs='http://www.opengis.net/wfs' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' version='1.0.0' service='WPS' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd'><ows:Identifier>gs:Nearest</ows:Identifier><wps:DataInputs><wps:Input><ows:Identifier>features</ows:Identifier><wps:Reference mimeType='text/xml' xlink:href='http://geoserver/wfs' method='POST'><wps:Body><wfs:GetFeature xmlns:IDENA_OGC='http://idena_ogc' service='WFS' version='1.0.0' outputFormat='GML2'><wfs:Query typeName='" + cfg.server.workspace + ":" + typeName + "' /></wfs:GetFeature></wps:Body></wps:Reference></wps:Input><wps:Input><ows:Identifier>crs</ows:Identifier><wps:Data><wps:LiteralData>" + cfg.map.projection + "</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>point</ows:Identifier><wps:Data><wps:ComplexData mimeType='application/wkt'><![CDATA[POINT(" + point.x + " " + point.y + ")]]></wps:ComplexData></wps:Data></wps:Input></wps:DataInputs><wps:ResponseForm><wps:RawDataOutput mimeType='application/json'><ows:Identifier>result</ows:Identifier></wps:RawDataOutput></wps:ResponseForm></wps:Execute>";
}
var alpha = 0;
function getAngle(p1, p2) {
	var deltaY = p2.y - p1.y;
	var deltaX = p2.x - p1.x;
	var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
	return angle - alpha;
}
function calculaRotacionCSS3(angulo) {
	return 360 - angulo;
}
function formatDistance(d) {
	if (d >= 1000) {
		d = (d / 1000).toFixed(1) + "km"
	} else {
		d = Math.round(d) + "m";
	}
	return d;	 
}
function getDistance() {
	return currentLoc.distanceTo(poiDestino)
}
var currentLoc;
var poiDestino;
function findNearestPOI(typeName, point) {
	$.ajax({
		type: "POST"
		, url: cfg.server.url
		, contentType: "application/xml; charset=utf-8"
		, data: gsNearestXML(typeName, point)
		//, dataType: "json"
		, success: function(result) {
			var frmt = new OpenLayers.Format.GeoJSON();
			var trgt = frmt.read(result);
			poiDestino = trgt[0].geometry;
			vector.addFeatures(trgt);
			drawUI();
		}
	});
}
var first;
var line;
function drawUI() {
	if (currentLoc && poiDestino) {
		if (first) {
			map.zoomToExtent(vector.getDataExtent());	
			$("#arrow, #distancia").show();
			first = false;
		}
		var rotation = calculaRotacionCSS3(Math.round(getAngle(currentLoc, poiDestino)));
		$("#arrow").rotate(rotation);
		$("#distancia").html(formatDistance(getDistance()));
		if (line) {
		    vector.removeFeatures(line);
		}
		line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([currentLoc, poiDestino]));
		vector.addFeatures([line]);	
	}
}
var map, vector, geolocate;
function initMap() {
    var b = new OpenLayers.Bounds(480408, 4599748, 742552, 4861892);
    map = new OpenLayers.Map('map', {
        projection: cfg.map.projection
        , maxExtent: b
    });
    var base = new OpenLayers.Layer.WMS(
                "IDENA_MapaBase",
                "http://idena.navarra.es/ogc/wms", {
                    layers: "mapaBase"
                }, {
                    isBaseLayer: true
                    , singleTile: true
                    //, transitionEffect: "resize"
                });

    var base = new OpenLayers.Layer.XYZ("IDENA_MapaBase", ["http://idena.navarra.es/ogc/wmts/ortofoto2012/default/epsg25830/${z}/${y}/${x}.jpeg"], {
        //projection: "EPSG:25830",
        sphericalMercator: true
    });
    var base = new OpenLayers.Layer.WMTS({
        name: "IDENA_MapaBase",
        url: "http://idena.navarra.es/ogc/wmts",
        layer: "ortofoto2012",
        matrixSet: "epsg25830",
        formatSuffix: "jpeg",
        version: "",
        style: "default",
        requestEncoding: "REST",
        numZoomLevels: 14
    });
    //var buzones = new OpenLayers.Layer.WMS(
    //            "BuzonesNavarra",
    //            "http://pmpwvtinet02.tcsa.local/geoserverreverseproxy/geoserver/IDENA_OGC/wms", {
    //                layers: "IDENA_OGC:DIRECC_Sym_Buzones"
    //            }, {
    //                singleTile: true
    //            });
    vector = new OpenLayers.Layer.Vector('vector');
    map.addLayers([base
        //, buzones
        , vector
    ]);
    geolocate = new OpenLayers.Control.Geolocate({
        bind: true,
        watch: true,
        geolocationOptions: { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    });
    map.addControl(geolocate);
    geolocate.events.register("locationupdated", geolocate, function (e) {
        currentLoc = e.point;
        if (!poiDestino) {
            vector.removeAllFeatures();
            vector.addFeatures([new OpenLayers.Feature.Vector(e.point)]);
            map.zoomToExtent(vector.getDataExtent());
            var poiType = FindPOIType();
            first = true;
            findNearestPOI(poiType.typeName, e.point);
        } else {
            drawUI();
        }
    });
    map.zoomToExtent(b);
}
var deviceorientation_evt;
function initOrientation() {
    if (!deviceorientation_evt) {
        if (window.DeviceOrientationEvent) {
            deviceorientation_evt = window.addEventListener("deviceorientation", function (e) {
                if (typeof (e.alpha) != 'undefined') {
                    //document.getElementById('resultDeviceOrientation').innerHTML = document.getElementById('resultDeviceOrientation').innerHTML + "Alpha: " + event.alpha + "<br>";
                    //document.getElementById('resultDeviceOrientation').innerHTML = document.getElementById('resultDeviceOrientation').innerHTML + "Beta: " + event.beta + "<br>";
                    //Check for iOS property
                    if (event.webkitCompassHeading) {
                        alpha = -event.webkitCompassHeading;
                        //Rotation is reversed for iOS
                        compass.style.WebkitTransform = 'rotate(-' + alpha + 'deg)';
                    }
                        //non iOS
                    else {
                        alpha = event.alpha;
                        if (!window.chrome) {
                            //Assume Android stock (this is crude, but good enough for our example) and apply offset
                            alpha = alpha - 270;
                        }
                    }
                    drawUI();
                }
                //if (typeof(event.absolute) != 'undefined') {
                //	document.getElementById('resultDeviceOrientation').innerHTML = document.getElementById('resultDeviceOrientation').innerHTML + "Gamma: " + event.absolute + "<br>";
                //}
                //if (typeof(event.compassCalibrate) != 'undefined') {
                //	document.getElementById('resultDeviceOrientation').innerHTML = document.getElementById('resultDeviceOrientation').innerHTML + "Gamma: " + event.compassCalibrated + "<br>";
                //}
            }, false);
        }
    }
}
function initGeoLocation() {
    geolocate.deactivate();
    geolocate.activate();
}
function initUI() {
    $("#poitypes").replaceWith(
        utils.generateSelect({
            data: cfg.poitypes
                , id: "poitypes"
                , valueField: "id"
                , textField: "name"
                , groups: {
                    data: cfg.poigroups
                    , sourceDataKey: "gid"
                    , groupsDataKey: "id"
                    , labelField: "label"
                }
                , emptyOption: {
                    value: "-1"
                    , text: i18n.search
                }
        }
        ).on("change", function () {
            if ($("#poitypes").val() != "-1") {
                initOrientation();
                poiDestino = null;
                initGeoLocation();
            }
        })
    );
}
(function init() {
    initUI();
    initMap();
})();
//window.setTimeout(init, 1);

//function onLocationFound(e) {
//	console.log(e);
//    var radius = e.accuracy / 2;
//    L.marker(e.latlng).addTo(map);
//		//.bindPopup("You are within " + radius + " meters from this point").openPopup();
//    //L.circle(e.latlng, radius).addTo(map);
//	encuentraBuzonProximo();
//}
//function onLocationError(e) {
//	map.setView([42.8167, -1.6442], 14);
//    console.log(e.message);
//}
//var map = L.map('map');
//L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    maxZoom: 19
//}).addTo(map);
//L.tileLayer.wms("http://pmpwvsig19:8080/geoserver/ows", {
//    layers: 'DIRECC_Sym_Buzones',
//    format: 'image/png',
//    transparent: true
//}).addTo(map);
//
//
//map.on('locationfound', onLocationFound);
//map.on('locationerror', onLocationError);
//map.locate({setView: true});