const { pgPool } = require('./server.js');

async function test(){
  try {
     const res = await fetch('http://localhost:8000/api/auth/login', {
       method: 'POST',
       headers:{'Content-Type':'application/json'},
       body: JSON.stringify({username:'admin', password:'123', rol:'admin'})
     });
     const data = await res.json();
     if(!data.token) { console.log('no token', data); return; }
     
     const req = await fetch('http://localhost:8000/api/pedidos', {headers:{'Authorization':'Bearer '+data.token}});
     const peds = await req.json();
     console.log("Total pedidos:", peds.length);
     console.log("Eventuales:", peds.filter(p=>!p.cliente_id).map(p=>({id:p.id, notas:p.notas})));
     
  }catch(e){
    console.error(e)
  }
}
test();