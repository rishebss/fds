import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "./Navbar"

function MotionDemo() {
  const [isVisible, setIsVisible] = useState(true)
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6 space-y-8">
      <motion.h1 
        className="text-4xl font-bold text-center mb-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        Framer Motion Demo
      </motion.h1>

      {/* Counter Animation */}
      <Card>
        <CardHeader>
          <CardTitle>Animated Counter</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <motion.div 
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
            className="text-6xl font-bold mb-4 text-blue-600"
          >
            {count}
          </motion.div>
          <div className="space-x-4">
            <Button 
              onClick={() => setCount(count + 1)}
              variant="outline"
            >
              Increment
            </Button>
            <Button 
              onClick={() => setCount(0)}
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Animation */}
      <Card>
        <CardHeader>
          <CardTitle>AnimatePresence Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Button 
              onClick={() => setIsVisible(!isVisible)}
              variant="outline"
            >
              Toggle Element
            </Button>
            
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg mx-auto max-w-md"
                >
                  <h3 className="text-xl font-semibold">I'm animated! 🎉</h3>
                  <p>This element enters and exits with smooth animations.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Gesture Animation */}
      <Card>
        <CardHeader>
          <CardTitle>Gesture Animations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.9 }}
              className="bg-red-500 text-white p-6 rounded-lg text-center cursor-pointer"
            >
              <h4 className="font-semibold">Hover & Tap</h4>
              <p className="text-sm">I scale and rotate!</p>
            </motion.div>
            
            <motion.div
              drag
              dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
              whileDrag={{ scale: 1.2 }}
              className="bg-green-500 text-white p-6 rounded-lg text-center cursor-grab active:cursor-grabbing"
            >
              <h4 className="font-semibold">Draggable</h4>
              <p className="text-sm">Drag me around!</p>
            </motion.div>
            
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="bg-blue-500 text-white p-6 rounded-lg text-center"
            >
              <h4 className="font-semibold">Auto Animation</h4>
              <p className="text-sm">I rotate forever!</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

export default MotionDemo