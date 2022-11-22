var cfg = {
    map: {
        projection: "EPSG:25830"
    }
    , server: {
        url: "http://pmpwvtinet02.tcsa.local/geoserverreverseproxy/geoserver/wps"
        , workspace: "IDENA_OGC"
    }
    , poigroups: [
        { "id": 1, "label": "Transporte" }
        , { "id": 2, "label": "Dotaciones" }
        , { "id": 3, "label": "Infraestructuras" }
        , { "id": 4, "label": "Direcciones" }
    ]
    , poitypes: [{
        id: "mailbox"
        , name: i18n.poitypes.mailbox
        , typeName: "DIRECC_Sym_Buzones"
        , gid: 4
    }, {
        id: "policeoffice"
        , name: i18n.poitypes.policeoffice
        , typeName: "DOTACI_Sym_PFOficinas"
        , gid: 2
    }, {
        id: "taxistop"
        , name: i18n.poitypes.taxistop
        , typeName: "TRAURB_Sym_TUCTaxis"
        , gid: 1
    }, {
        id: "paradasbus"
        , name: i18n.poitypes.paradasbus
        , typeName: "TRAURB_Sym_TUCParadasBus"
        , gid: 1
    }, {
        id: "recargabus"
        , name: i18n.poitypes.recargabus
        , typeName: "TRAURB_Sym_RecargaBus"
        , gid: 1
    }, {
        id: "snsprimaria"
        , name: i18n.poitypes.snsprimaria
        , typeName: "DOTACI_Sym_SNSPrimaria"
        , gid: 2
    }, {
        id: "aeropuerto"
        , name: i18n.poitypes.aeropuerto
        , typeName: "INFRAE_Sym_Aeropuerto"
        , gid: 3
    }, {
        id: "estaciontren"
        , name: i18n.poitypes.estaciontren
        , typeName: "INFRAE_Sym_FFCCEstac"
        , gid: 3
    }, {
        id: "snsespecial"
        , name: i18n.poitypes.snsespecial
        , typeName: "DOTACI_Sym_SNSEspecial"
        , gid: 2
    }, {
        id: "snsmujer"
        , name: i18n.poitypes.snsmujer
        , typeName: "DOTACI_Sym_SNSMujer"
        , gid: 2
    }, {
        id: "snsmental"
        , name: i18n.poitypes.snsmental
        , typeName: "DOTACI_Sym_SNSMental"
        , gid: 2
    }, {
        id: "instdeportivas"
        , name: i18n.poitypes.instdeportivas
        , typeName: "DOTACI_Sym_InstalDepo"
        , gid: 2
    }]
}
/*
DOTACI_Sym_AlojTur Alojamientos turísticos
DOTACI_Sym_RecTur Recursos turísticos
DOTACI_Sym_Restaurant Restaurantes
DOTACI_Sym_CenComer Grandes superficies
*/