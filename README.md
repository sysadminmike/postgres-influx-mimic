# postgres-influx-mimic
node proxy to query postgres but output as influx for grafana backend

Postgres db contains jsonb records looking like (the data could come from any table):

```
{
   "_id": "e832faf5b9421d53f7da348755db8e09",
   "_rev": "1-3b6906d2712b795411c1e0f3405f6d7c",
   "type": "counter",
   "name": "statsd.packets_received",
   "count": 7003,
   "ts": 1424734183
}
```

start the proxy 
```
mike@stuff.mw.office:~/pg-influx % node pg-influx.js
Listening on port 8086
Connected to postgres

```

in another window query it:
```
curl -G 'http://192.168.3.22:8086/query?pretty=true' --data-urlencode "q=WITH \
results AS ( \
  SELECT to_timestamp((doc->>'ts')::int) at time zone 'UTC' AS time, (doc->>'count')::numeric AS value FROM aatest \
  WHERE doc->>'name'='statsd.packets_received' AND (doc->>'count')::numeric > 0 \
  ORDER BY time \
), \
values AS (SELECT json_agg(json_build_array(time,value)) AS v FROM results) \
SELECT '{\"results\": [{ \
            \"series\": [{ \
                    \"name\": \"statsd.packets_received\", \
                    \"columns\": [\"time\", \"value\"], \
                    \"values\": ' || v || ' \
                }] \
        }]}' AS ret FROM values"
```

Should give back something similar to influx which can be used for grafana

```
[mike@f10 ~]$ curl -G 'http://192.168.3.22:8086/query?pretty=true' --data-urlencode "q=WITH \
> results AS ( \
>   SELECT to_timestamp((doc->>'ts')::int) at time zone 'UTC' AS time, (doc->>'count')::numeric AS value FROM aatest \
>   WHERE doc->>'name'='statsd.packets_received' AND (doc->>'count')::numeric > 0 \
>   ORDER BY time LIMIT 10\
> ), \
> values AS (SELECT json_agg(json_build_array(time,value)) AS v FROM results) \
> SELECT '{\"results\": [{ \
>             \"series\": [{ \
>                     \"name\": \"statsd.packets_received\", \
>                     \"columns\": [\"time\", \"value\"], \
>                     \"values\": ' || v || ' \
>                 }] \
>         }]}' AS ret FROM values"


{"results": [{             "series": [{
"name": "statsd.packets_received",   
"columns": ["time", "value"],
"values": [["2015-02-23T23:23:46", 1],
["2015-02-23T23:24:56", 501], 
["2015-02-23T23:25:46", 501], 
["2015-02-23T23:28:23", 501],
["2015-02-23T23:28:43", 89],
["2015-02-23T23:28:53", 3235], 
["2015-02-23T23:29:03", 1181],
["2015-02-23T23:29:33", 530],
["2015-02-23T23:29:43", 7003],
["2015-02-23T23:29:53", 5604]]                 }]         }]}
[mike@f10 ~]$ 

```


Point grafana at it - need to get this tested now and see what happens 
