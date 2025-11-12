'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode, HTMLAttributes } from 'react'

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  hover = true,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hover ? { 
        y: -4,
        scale: 1.02,
        transition: { 
          duration: 0.2, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      } : undefined}
      whileTap={hover ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined}
    >
      <Card 
        className={cn(
          "transition-all duration-300 ease-out",
          hover && "hover:shadow-xl hover:shadow-black/5",
          className
        )} 
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

