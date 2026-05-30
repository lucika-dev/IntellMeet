import Head from 'next/head';
import React from 'react'

const docs = () => {
  return (
    <>
        <div className='flex bg-background h-screen justify-center items-center'>
            <h1 className="text-4xl text-foreground font-bold">Docs</h1>
        </div>
        <div className='flex bg-primary h-screen justify-center items-center'>
            <p className='text-secondary text-[5vw]'>This is the documentation page.</p>
        </div>
    </>
  )
}

export default docs;