var buildQuery = require('./buildQuery');
var stringifyQuery = require('./stringifyQuery');

var defaultPropertyTransform = {
    from: x => x,
    to: x => x
};

function find(query, callback){
    var model = this;

    var query = buildQuery(query, model);
    console.log(query);
    var sql = stringifyQuery(query);

    callback(null, sql);
}

function createModel(settings, name, modelSettings){
    var model = {
        name: name,
        settings: settings,
        fields: modelSettings.fields,
        singular: modelSettings.singular
    };

    model.find = find.bind(model);
    return model;
}

function initModel(model){
    var models = model.settings.models;

    for(var key in model.fields){
        var field = model.fields[key];

        if(field.model){
            field.model = models[field.model];
        }
        if(field.through){
            field.through = models[field.through];
        }
    }
}

function buildModels(settings){
    settings.transformProperty = settings.transformProperty || defaultPropertyTransform;

    var models = {};

    for(var key in settings.models){
        models[key] = createModel(settings, key, settings.models[key]);
    }

    settings.models = models;

    for(var key in models){
        initModel(models[key]);
    }

    return models;
}

function init(settings){
    var models = buildModels(settings);

    return models;
}

module.exports = init;