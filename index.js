
const TeleBot = require('telebot');
const Binance= require('binance-api-node').default;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter_t = new FileSync('db_t.json');
const dbt = low(adapter_t);
const adapter_tele = new FileSync('telekey.json');
const teledb = low(adapter_tele);
const bot = new TeleBot(teledb.get('telekey').value());
const Discord = require('discord.js');

const adapter_di= new FileSync('discordkey.json');
const discorddb = low(adapter_di);
const client = new Discord.Client();

// STRINGS
const ayudatxt="Hola, tengo los siguientes commandos disponibles:\r\n\
registro\r\nprecio\r\nmarket\r\nlimit\r\nstoplimit\r\nPara obtener mas información use: /explica [comando]\r\n\
Mantenga un chat abierto conmigo para usarme mejor";

const registrotxt="Entre a su cuentra de Binance y entre a Cuenta->API y genere sus llaves de API con Withdrawals DESHABILITADO\r\n\
luego escriba el siguiente comando por seguridad de preferencia en mensaje PRIVADO: /registro [Llave publica] [Llave privada]";

const preciotxt="Se despliega el precio promedio\r\nUse: /precio [Moneda1] [Moneda2]\r\n\
Ejemplo: /precio ETH BTC";

const markettxt="Use: /market [Lado] [Moneda1] [Moneda2] [Cantidad]\r\n\
Ejemplo: /market BUY ETH BTC 0.05\r\nDespues confirme o cancele la orden con los botones";

const limittxt="Use: /limit [Lado] [Moneda1] [Moneda2] [Cantidad] [Precio]\r\n\
Ejemplo: /limit BUY ETH BTC 0.05 0.033497\r\nDespues confirme o cancele la orden con los botones";

const stoplimittxt="Use: /stoplimit [Lado] [Moneda1] [Moneda2] [Cantidad] [Limit] [Stop]\r\n\
Ejemplo: /stoplimit BUY ETH BTC 0.05 0.033497 0.02\r\nDespues confirme o cancele la orden con los botones";

const errortxt="Error llamando comando";

//DB
dbt.defaults({data: [{ 
    id: "",
    chat: "", 
    publicKey: "", 
    privateKey: "", 
    orders:[]
}]}).write();


//TELEGRAM
//bot.on('text', (msg) => msg.reply.text(msg.text));
bot.on('/ayuda', (msg) => msg.reply.text(ayudatxt));
bot.on(/^\/explica$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/explica ([^ ]+)$/,(msg,props) => 
{
    var txt="";
    if (props.match[1]==="ayuda")
    {
        txt= ayudatxt;
    }
    else if (props.match[1]==="registro")
    {
        txt=registrotxt;
    }
    else if (props.match[1]==="limit")
    {
        txt=limittxt;
    }
    else if (props.match[1]==="market")
    {
        txt=markettxt;
    }
    else if (props.match[1]==="stoplimit")
    {
        txt=stoplimittxt;
    }
    else if (props.match[1]==="precio")
    {
        txt=preciotxt;
    }
    else
    {
        txt= errortxt;
    }
    return msg.reply.text(txt);
});

bot.on(/^\/registro$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/registro ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/registro ([^ ]+) ([^ ]+)$/,(msg,props) => 
{
    //console.log(msg);
    var txt="Registro exitoso";
    var user=msg.from.username;
    var chatid= msg.from.id;
    var public= props.match[1];
    var private = props.match[2];
    var member=dbt.get('data').find({ id: user });
    if (member.value()==undefined)
    {
        var obj={ id: user,chat: chatid, publicKey: public, privateKey: private, orders:[]};
        dbt.get("data").push(obj).write();
        //console.log(obj);
    }
    else
    {        
        var obj={publicKey: public, privateKey: private};
        member.assign(obj).write();
        //console.log(obj);
    }   
    return msg.reply.text(txt);
});

bot.on(/^\/precio$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/precio ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/precio ([^ ]+) ([^ ]+)$/, async function(msg,props)
{
    var client= Binance();
    var s1=props.match[1].toUpperCase();
    var s2=props.match[2].toUpperCase();
    var dat= {symbol:s1+s2};
    var txt;
    var result;
    try
    {
        result= await client.avgPrice(dat);
        txt= "1 "+ s1+ " cuesta "+ result.price+ " "+ s2;
        //console.log(result);
    }
    catch(err)
    {
        //console.log(result);
        txt=chkerr(err);
    }
    return msg.reply.text(txt);
});

bot.on(/^\/market$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/market ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/market ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/market ([^ ]+) ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/market ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/,  function(msg,props)
{   
    var dat= "m," +props.match[1] +","+ props.match[2] +","+props.match[3]+"," +props.match[4];
    var replyMarkup= bot.inlineKeyboard([
        [
            bot.inlineButton('Confirmar', {callback:dat}),
        ], [
            bot.inlineButton('Cancelar', {callback: 'c'})
        ]
    ]);
    //console.log(msg);
    // /market [Lado] [Moneda1] [Moneda2] [Cantidad]
    return bot.sendMessage(msg.from.id,"Confirme su orden",{replyMarkup});
   
});

bot.on(/^\/limit$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/limit ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/limit ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/limit ([^ ]+) ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/limit ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/limit ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/,  function(msg,props)
{   
    var dat= "l," +props.match[1] +","+ props.match[2] +","+props.match[3]+"," +props.match[4]+","+props.match[5];
    var replyMarkup= bot.inlineKeyboard([
        [
            bot.inlineButton('Confirmar', {callback:dat}),
        ], [
            bot.inlineButton('Cancelar', {callback: 'c'})
        ]
    ]);
    //console.log(msg);
    // /limit [Lado] [Moneda1] [Moneda2] [Cantidad] [Precio]
    return bot.sendMessage(msg.from.id,"Confirme su orden",{replyMarkup});   
});

bot.on(/^\/stoplimit$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/stoplimit ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/stoplimit ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/stoplimit ([^ ]+) ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/stoplimit ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/stoplimit ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/, (msg) => msg.reply.text(errortxt));
bot.on(/^\/stoplimit ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/,  function(msg,props)
{   
    var dat= "s," +props.match[1] +","+ props.match[2] +","+props.match[3]+"," +props.match[4]+","+props.match[5]+","+props.match[6];
    var replyMarkup= bot.inlineKeyboard([
        [
            bot.inlineButton('Confirmar', {callback:dat}),
        ], [
            bot.inlineButton('Cancelar', {callback: 'c'})
        ]
    ]);
    //console.log(msg);
    // /stoplimit [Lado] [Moneda1] [Moneda2] [Cantidad] [Limit] [Stop]
    return bot.sendMessage(msg.from.id,"Confirme su orden",{replyMarkup});   
});


bot.on('callbackQuery', async function(msg) {
    console.log(msg);
    console.log(Buffer.from(msg.data).length);
    var data = msg.data.split(",");
    var txt="Error";
    //console.log(data);
    //TODO extract values with substring
    if(data=="c")
    {  
         
        txt="Operación cancelada";    
    }
    else
    {
        var option;
        var sym;
        var cant;
        var typ;
        var user=msg.from.username;
        var member=dbt.get('data').find({ id: user });
        if (member.value()==undefined)
        {
            txt= "No esta registrado, use /registro";
        }
        else
        {        
            var client =Binance({apiKey: member.value().publicKey,
            apiSecret: member.value().privateKey});
             //option= props.match[1].toUpperCase();
            
            if(data[0]=="m")
            {
                typ="MARKET";
            }
            else if (data[0]=="l")
            {
                typ="LIMIT";
            }
            else if (data[0]=="s")
            {
                typ="STOP_LOSS_LIMIT";
            }
            else
            {
                console.log("type error")
                bot.deleteMessage(msg.message.chat.id,msg.message.message_id);    
                return bot.answerCallbackQuery(msg.id, {text:txt, showAlert: false}); 
            }
            option=data[1].toUpperCase();
            if (option=="BUY"||option=="SELL")
            {
                sym=data[2].toUpperCase() + data[3].toUpperCase();
                cant=data[4];
                if(isNaN(cant))
                {
                    txt= "Escriba un numero valido";
                }
                else
                {
                    var obj=  {
                        symbol: sym,
                        side: option,
                        quantity: cant,
                        type: typ
                      }; 
                    var result;

                    if(typ=="LIMIT"||typ=="STOP_LOSS_LIMIT")
                    {
                        var prc;
                        obj.timeInForce="GTC";
                        prc=data[5];
                        if(isNaN(prc))
                        {
                            txt= "Escriba un numero valido";
                            bot.deleteMessage(msg.message.chat.id,msg.message.message_id);    
                            return bot.answerCallbackQuery(msg.id, {text:txt, showAlert: false});
                        }
                        else
                        {
                            obj.price=prc;
                            if(typ=="STOP_LOSS_LIMIT")  
                            {
                                var stop=data[6];
                                if(isNaN(stop))
                                {
                                    txt= "Escriba un numero valido";
                                    bot.deleteMessage(msg.message.chat.id,msg.message.message_id);    
                                    return bot.answerCallbackQuery(msg.id, {text:txt, showAlert: false});
                                }
                                else
                                {
                                    obj.stopPrice=stop;
                                }                                
                            }
                        }
 
                    }
                    console.log(obj);
                    try
                    {                 
                        result = await client.order(obj);                           
                        console.log(result);
                        txt="Operación exitosa";  
                        if(typ=="LIMIT"||typ=="STOP_LOSS_LIMIT")
                        {
                            //console.log(member.get("orders").value());
                            member.get("orders").push({symbol: result.symbol,orderId:result.orderId}).write();                       
                            //console.log(member);
                        }                    
                    }
                    catch(err)
                    {
                        txt=chkerr(err);                        
                    }
                }
            }
            else
            {
                txt= "Error en el lado de la compra, use buy o sell";
            }
    
        }
    }
    bot.deleteMessage(msg.message.chat.id,msg.message.message_id);    
    //console.log("after edit");
    return bot.answerCallbackQuery(msg.id, {text:txt, showAlert: false});
});
bot.start();
////LOOP
var user_iterator_t=0;
var order_iterator_t=0;

var user_iterator_d=0;
var order_iterator_d=0;


async function loopt()
{
    //var start = process.hrtime();
    var data=dbt.get('data['+user_iterator_t+']').value();
    var user;
    var orders;
    var chatid;    
    //console.log(data);
    if(data==undefined)
    {
        user_iterator_t=0;
    }
    else
    {
        user=data.id;
        chatid=data.chat;
        orders= data.orders;        
        if(orders.length==0)
        {
            user_iterator_t++;
            order_iterator_t=0;
            //console.log("no orders");
            //no orders
        }
        else
        {
            //console.log(orders[order_iterator_t]);
            
            if(orders[order_iterator_t]==undefined)
            {
                user_iterator_t++;
                order_iterator_t=0;
                //console.log("order undefined");
                //order undefined
            }
            else
            {
                //console.log("After checks");
                //console.log(orders.length);
                //console.log(orders[order_iterator_t]);
                //bot.sendMessage(chatid,"Checando orden");
                var client =Binance({apiKey: data.publicKey,
                apiSecret: data.privateKey});
                var sym=orders[order_iterator_t].symbol;
                var orid=orders[order_iterator_t].orderId;
                var result=await client.getOrder({
                    symbol:sym ,
                    orderId: orid,
                  });
                  //console.log(result);
                if(result.status=="FILLED"||result.status=="CANCELED"||result.status=="REJECTED"||result.status=="EXPIRED")
                {
                    var path='data['+user_iterator_t+'].orders';
                    dbt.get(path).remove({ symbol: sym, orderId: orid}).write();
                    var txt=notificationtxt(result);
                    bot.sendMessage(chatid,txt); 
                }
                else
                {
                    order_iterator_t++;
                }
                //console.log("before remove");
                //console.log("user:" +user_iterator_t+ " order: "+ order_iterator_t);
                //console.log(path);
                //console.log(dbt.get(path).value());
                //console.log(result);
                //console.log("End loop");
                //var precision = 3; // 3 decimal places
                //var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
                //console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms"); // print message + time
            }
        }
        
    }
        
}

setInterval(loopt, 333);


////DISCORD
client.on('ready', () => {
    console.log('I am ready!');
  });
  

client.on('ayuda', message => 
{
    //console.log(message);
    message.author.send("here").catch(console.error);;
});
client.login(discorddb.get('token').value());


////FUNCS
function chkerr(err)
{
    var txt;
    console.log("catch, printing err");
    console.log(err);
    console.log(err.code);
    if(err.code == -1100)
    {
        txt= "Revise la forma en como escribio los numeros";
    }
    else if (err.code == -1121)
    {
        txt="Binance no maneja esa transacción de monedas";
    }
    else if (err.code == -1013)
    {
        txt="La cantidad es demasiado alta o baja";
    }
    else if(err.code == -1013)
    {
        txt="precio*cantidad es demasiado pequeña para ser una orden valida para ese simbolo";
    }
    else if(err.code == -1111)
    {
        txt="La precisión esta sobre el maximo definido para este simbolo";
    }
    else if (err.code==-2010)
    {
        txt= "Balance insuficiente en su cuenta";
    }
    else
    {
        txt="Error";
    }
    return txt;
}

function notificationtxt(result)
{
    var txt="Su orden ";
    if(result.type=="LIMIT")
    {
        txt+= "limit ";
    }
    else if(result.type=="MARKET")
    {
        txt+= "market ";
    }
    else if(result.type=="STOP_LOSS_LIMIT")
    {
        txt+= "stoplimit ";
    }
    else
    {
        txt+="¿tipo? ";
    }

    if (result.side=="BUY")
    {
        txt+="de comprar ";
    }
    else if(result.side=="SELL")
    {
        txt+="de vender ";
    }
    else
    {
        txt+="¿lado? ";
    }

    txt= txt+result.origQty+" ";
    txt= txt+result.symbol+" ";
    if(result.type=="LIMIT"||result.type=="STOP_LOSS_LIMIT")
    {
        txt=txt+"a un precio de "+ result.price+" ";
        if(result.type=="STOP_LOSS_LIMIT")
        {
            txt= txt+"y con un stop de " + result.stopPrice +" ";
        }
    }
    if(result.status=="CANCELED")
    {
        txt= txt+ "ha sido cancelada";
    }
    else if(result.status=="EXPIRED")
    {
        txt= txt+ "ha expirado";
    }
    else if(result.status=="REJECTED")
    {
        txt= txt+ "ha sido rechazada";
    }
    else if(result.status=="FILLED")
    {
        txt= txt+ "ha sido ejecutada";
    }
    else
    {
        txt= txt+ "¿status?";
    }

    return txt;

}
