import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Package, RotateCw, Truck } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

/**
 * Centralised e‑commerce dashboard prototype
 * --------------------------------------------------
 * ‣ Integrates (placeholder) Shopify/WooCommerce + ShipStation/ShipHero APIs
 * ‣ Shows orders, inventory, returns + analytics at a glance
 * --------------------------------------------------
 * HOW TO USE
 * 1. Create a .env.local with SHOP_API_KEY, SHIP_API_KEY
 * 2. Replace fetch stubs with real endpoints or proxy functions
 * 3. Run `npm run dev` (Vite or Next.js) and demo to stakeholders
 */

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [o, i, r] = await Promise.all([
          fakeFetch("/orders"),
          fakeFetch("/inventory"),
          fakeFetch("/returns"),
        ]);
        setOrders(o);
        setInventory(i);
        setReturns(r);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const analytics = {
    orderVolume: orders.length,
    fulfillmentTime: averageHours(orders.map((o) => o.fulfillmentHrs)),
    returnRate: percentage(returns.length, orders.length),
  };

  async function handleGenerateLabel(orderId) {
    await fakeLabel(orderId);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading dashboard…
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Orders" value={analytics.orderVolume} Icon={Package} />
        <KpiCard title="Avg. Fulfillment (hrs)" value={analytics.fulfillmentTime} Icon={Truck} />
        <KpiCard title="Return Rate" value={`${analytics.returnRate}%`} Icon={RotateCw} />
      </div>
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <SectionTable headers={['ID','Customer','Status','Label']} rows={orders.map(o=>[
            o.id,o.customer,o.status,<Button size='sm' onClick={()=>handleGenerateLabel(o.id)}>Generate</Button>
          ])}/>
        </TabsContent>
        <TabsContent value="inventory">
          <SectionTable headers={['SKU','Product','Stock','Channel']} rows={inventory.map(i=>[i.sku,i.name,i.stock,i.channel])}/>
        </TabsContent>
        <TabsContent value="returns">
          <SectionTable headers={['ID','Customer','Reason','Status']} rows={returns.map(r=>[r.id,r.customer,r.reason,r.status])}/>
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsCharts orders={orders} returns={returns} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function KpiCard({ title, value, Icon }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center p-4 space-x-4">
        <Icon className="w-6 h-6" />
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTable({ headers, rows }) {
  return (
    <div className="overflow-auto rounded border">
      <table className="min-w-full text-sm whitespace-nowrap">
        <thead className="bg-gray-50">
          <tr>{headers.map(h=><th key={h} className='px-4 py-2 text-left font-medium'>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cells,idx)=>(
            <tr key={idx} className='border-t'>{cells.map((c,i)=><td key={i} className='px-4 py-2'>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsCharts({ orders, returns }) {
  const monthly = aggregateMonthly(orders);
  const returnMonthly = aggregateMonthly(returns);
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <Card><CardContent className='p-4 h-64'><p className='mb-2 font-medium'>Monthly Order Volume</p>
        <ResponsiveContainer width='100%' height='100%'><BarChart data={monthly}>
          <XAxis dataKey='month'/><YAxis/><Tooltip/><Bar dataKey='count'/></BarChart></ResponsiveContainer>
      </CardContent></Card>
      <Card><CardContent className='p-4 h-64'><p className='mb-2 font-medium'>Return Rate Trend</p>
        <ResponsiveContainer width='100%' height='100%'><LineChart data={returnMonthly}>
          <XAxis dataKey='month'/><YAxis/><Tooltip/><Line type='monotone' dataKey='rate' strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
      </CardContent></Card>
    </div>
  );
}

function percentage(part,total){return total===0?0:((part/total)*100).toFixed(1);}
function averageHours(arr){if(!arr.length) return 0; return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1);}
function aggregateMonthly(arr){
  const map={}; arr.forEach(o=>{const month=new Date(o.date).toLocaleString('default',{month:'short'});
    if(!map[month]) map[month]={month,count:0,rate:0};
    map[month].count+=1; if(o.rate) map[month].rate=o.rate;
  });return Object.values(map);
}
async function fakeFetch(key){await new Promise(r=>setTimeout(r,200));
  switch(key){
    case '/orders': return [{id:'1001',customer:'GANKIMA GOLI',status:'Pending',fulfillmentHrs:0,date:'2025-04-20'}];
    case '/inventory': return [{sku:'SKU-001',name:'Wireless Earbuds',stock:100,channel:'JINGDONG'}];
    case '/returns': return [{id:'R-01',customer:'GANKIMA GOLI',reason:'Defective',status:'Received',date:'2025-04-22',rate:5}];
    default: return [];
  }
}
async function fakeLabel(id){alert(`Shipping label for ${id}`);}
