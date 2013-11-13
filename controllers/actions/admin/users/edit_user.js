this.init = function(request, output)
{
    getSession(request, function(session)
    {
        if(!session['user'] || !session['user']['admin'])
        {
            output({redirect: SITE_ROOT});
            return;
        }
    
        var get = getQueryParameters(request);
        var post = getPostParameters(request);
        
        if(message = checkForRequiredParameters(post, ['username', 'email', 'admin']))
        {
            formError(request, session, message, '/admin/users', output);
            return;
        }
        if(message = checkForRequiredParameters(get, ['id']))
        {
            formError(request, session, message, '/admin/users', output);
            return;
        }
        if(session['user']['admin'] < post['admin'])
        {
            formError(request, session, '^loc_INSUFFICIENT_CREDENTIALS^', '/admin/users', output);
            return;
        }
        
        getDBObjectsWithValues({object_type: 'user', _id: ObjectID(get['id'])}, function(data)
        {
            if(data.length == 0)
            {
                formError(request, session, '^loc_ERROR_SAVING^', '/admin/users', output);
                return;
            }
            
            var userDocument = createDocument('user', post);
            
            getDBObjectsWithValues({object_type: 'user', username: userDocument['username']}, function(data)
            {
                if(data.length > 0)
                {
                    if(!data[0]._id.equals(user._id))
                    {
                        formError(request, session, '^loc_EXISTING_USERNAME^', '/admin/users', output);
                        return;
                    }
                }
                
                getDBObjectsWithValues({object_type: 'user', email: userDocument['email']}, function(data)
                {
                    if(data.length > 0)
                    {
                        if(!data[0]._id.equals(user._id))
                        {
                            formError(request, session, '^loc_EXISTING_EMAIL^', '/admin/users', output);
                            return;
                        }
                    }
                
                    editDBObject(user._id, userDocument, ['password'], function(data)
                    {
                        if(data.length == 0)
                        {
                            formError(request, session, '^loc_ERROR_SAVING^', '/admin/users', output);
                            return;
                        }
                        
                        session.success = '^loc_USER_EDITED^';
                        editSession(request, session, [], function(data)
                        {        
                            output({redirect: SITE_ROOT + '/admin/users'});
                        });
                    });
                });
            });
        });
    });
}