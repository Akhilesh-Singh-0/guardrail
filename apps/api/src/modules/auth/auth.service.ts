import {prisma} from "../../config/prisma"

type ClerkUserCreatedEvent = {
    id: string;
    email_addresses?: {
        email_address: string;
    }[];
}

export const handleUserCreated = async (data: ClerkUserCreatedEvent) => {
    try {
        const id = data.id
        const email = data?.email_addresses?.[0]?.email_address;

        if(!id || !email){
          console.error("Invalid user.created payload:", data)
          return
        }

        await prisma.user.upsert({
          where: { id },
          update: { email },
          create: { id, email }
        })
    
        console.log('[Auth] User synced:', id)
    } catch (error) {
        console.error("Error handling user.created webhook:", error)
        throw error
    }
}