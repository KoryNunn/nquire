var test = require('tape');
var nquire = require('../');

test('x', function(t){

    var db = nquire({
        models: {
            users: {
                fields: {
                    firstName: 'string',
                    surname: 'string',
                    dateOfBirth: 'date',
                    staff: { model: 'staff' },
                    company: { model: 'companies', through: 'staff' }
                }
            },
            companies: {
                singular: 'company',
                fields: {
                    name: 'string',
                    active: true
                }
            },
            staff: {
                fields: {
                    userId: { model: 'users', column: 'id' },
                    companyId: { model: 'companies', column: 'id' },
                    active: 'boolean'
                }
            }
        }
    });

    db.users.find({
        where: {
            staff: {
                active: true
            },
            company: {
                active: true
            }
        },
        include: {
            $fields: ['*']
        }
    }, function(error, result){
        console.log(error, result);
    });

});