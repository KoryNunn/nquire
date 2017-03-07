function getSubModel(property, model){
    if(!model){
        return;
    }

    return model.fields[property] && model.fields[property].model;
}

function getThroughModel(property, model){
    if(!model){
        return;
    }

    return model.fields[property] && model.fields[property].through;
}

function uniqueKeys(objects){
    return Object.keys(objects.reduce(function(result, object){
        for(var key in object){
            result[key] = true;
        }
        return result;
    }, {}));
}

function buildQuery(settings, where, include, model, alias, through){
    if(include && include.$fields){
        include.$fields.forEach(function(field){
            include[field] = true;
        });
        delete include.$fields;
    }

    var result = {
            where: {},
            attributes: ['id'],
            model: model,
            required: false,
            through: through
        },
        keys = uniqueKeys([where, include, model.fields]);

    if (alias) {
        result.as = alias;
    }

    var includeResult = {};

    keys.forEach(function(key){
        var field = model.fields[key],
            subModel = getSubModel(key, model);

        if(typeof where === 'object' && key in where && !subModel){
            result.where[key] = settings.transformProperty.to(where[key], model, key);
            result.required = true;
        }

        if(key !== '*' && include && !subModel && (include === true || include[key] || include['*'])){
            result.attributes.push(key);
        }

        if(subModel && (where && where[key] || include && include[key])){
            // another check here could be model.associations[key].isSelfAssociation however the as is a generic thingy that isnt limited to selfassociations
            var alias = field.as ? field.as : false;
            result.required = true;

            includeResult[key] = buildQuery(
                settings,
                where && where[key],
                include && include[key],
                subModel,
                alias,
                getThroughModel(key, model)
            );
        }
    });

    var includeKeys = Object.keys(includeResult);

    if(includeKeys.length) {
        result.include = includeKeys.map(function(key){
            return includeResult[key];
        });
    }

    return result;
}

function parseSettings(settings, model){
    var sequelizeSettings = buildQuery(
        model.settings,
        settings.where,
        settings.include,
        model
    );

    for(var key in settings){
        if(key === 'where' || key === 'include'){
            continue;
        }

        sequelizeSettings[key] = settings[key];
    }

    return sequelizeSettings;
}

module.exports = parseSettings;