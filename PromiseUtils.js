//var Promise = require('promised-io/promise');

class PromiseUtils
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
		return PromiseUtils.runAtMax( array ,generator ,1 );
	}

	static runAtMax( array, generator, max )
	{
		if( array.length == 0 )
			return Promise.resolve( [] );

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

	/*
	let i =5;
		let fun = ()=>{
			console.log('Hello');
			i--;
			return i == 0;
		};

		PromiseUtils.tryNTimes( fun, 1000, 10 );

		//fun = ()=>{
		//	console.log('Hello');
		//	return false;
		//};

		PromiseUtils.tryNTimes( fun, 1000, 10 ).catch((m)=>console.log( m) );

	//*/

	static tryNTimes( fun, delayBetweenRunsInMillis, times )
	{
		let result = fun();

		if( result !== false )
			return Promise.resolve( result );

		if( times === 0 )
		{
			return Promise.reject(  result );
		}

		return this.resolveAfter( false, delayBetweenRunsInMillis, 1).then(()=>
		{
			return this.tryNTimes( fun, delayBetweenRunsInMillis, times-1 );
		});
	}
}

