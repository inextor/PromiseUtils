class PromiseUtil
{
	static resolveAfter( value, milliseconds )
    {   
        return new Promise((resolve, reject)=>
        {   
            setTimeout(()=>{ resolve( value ); }, milliseconds );
        }); 
    }   

    static rejectAfter( value, milliseconds )
    {   
        return new Promise((resolve, reject)=>
        {
            setTimeout(()=>{ reject( value ); }, milliseconds );
        }); 
    }   

	static runSequential( array ,generator )
	{
		return promiseMax( array ,generator ,1 );
	}

	static runAtMax( array, generator, max )
	{
		var results = new Array( array.length );
		var taskers	= new Array( max );

		var indexes	= array.reduce((prev,curr,index)=>
		{
			prev.push(index);
			return prev;
		},[]);

		var tasker = ()=>
		{
			var index =  indexes.pop();

			if( typeof index === 'undefined' )
			{
				return Promise.resolve(true);
			}

			return generator(array[index],index).then
			(
				(value)=>
				{
					results[index] = value;
					return tasker();
				}
				,(reason)=>
				{
					return Promise.reject( reason );
				}
			);
		};

		for(var i=0;i<max;i++)
		{
			taskers[i] = tasker();
		}

		return Promise.all( taskers ).then
		(
		 	value	=>{ return Promise.resolve( results ); }
			,reason =>{ return Promise.reject( reason ); }
		);
	}

	static all( object )
	{
		var promises	= [];
		var index		= [];

		for( var i in object )
		{
			index.push( i );
			promises.push( object[ i ] );
		}

		return new Promise((resolve,reject)=>
		{
			Promise.all( promises ).then
			(
			 	(values)=>
				{
					var obj = {};
					for(var i=0;i<values.length;i++)
					{
						obj[ index[ i ] ] = values [ i ];
					}

					resolve( obj );
				},
				(reason)=>
				{
					reject( reason );
				}
			);
		});
	}
}
