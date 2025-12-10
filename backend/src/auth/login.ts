import {FastifyInstance} from 'fastify';
import { prisma } from '../config/prismaClient';
import bcrypt from 'bcrypt';


export default async function loginRoute(app:FastifyInstance) {
    app.post('/login',async(request,reply) => {
        const {email,password}= request.body as {email:string,password:string};

        const barber= await prisma.barber.findUnique({
            where: { email }
        });
        if(!barber){
            return reply.status(404).send({error:'Credenciais inválidas'});
        }
        const correctPassword = await bcrypt.compare(password,barber.password);
        if(!correctPassword){
            return reply.status(404).send({error:'Credenciais inválidas'});
        }
        const token = 
        app.jwt.sign({id:barber.id,name:barber.name,email:barber.email});

        return reply.send({
            message:"Login realizado com sucesso",
            token});
    })
    
}