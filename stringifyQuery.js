function getSubPrefix(query){
    return (query.model.singular || query.model.name.replace(/s$/, '')) + '.';
}

function buildSql(query, subQuery){
    var sql = 'SELECT ',
        asPrefix = '';

    if(subQuery){
        asPrefix = getSubPrefix(query);
    }

    query.attributes.forEach(function(attribute){
        var selector = query.model.name + '.' + attribute,
            as =  asPrefix + attribute;

        sql += selector + ' ' +
            'as ' + '\'' + as + '\'';
    });

    sql += '\nFROM ' + query.model.name;

    if(query.include){
        sql += ' JOIN ' + query.include.map(function(include){
            var on = '';

            if(include.through){
                on += buildSql(include, true);
            }else if(include.column){
                on += ' ON' + asPrefix + include.column + ' = ' + getSubPrefix(include);
            }else{

            }

            return on;
        });
    }

    // sql += 'WHERE ' + object.keys(query.where).map(function(whereKey){
    //     var where = query.where[whereKey];

    //     return
    // });

    return sql;
}

module.exports = function(query){
    return buildSql(query);
}