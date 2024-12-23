// https://github.com/redpangilinan/credenza
//
// import {
//   ResponsiveDialog,
//   ResponsiveDialogBody,
//   ResponsiveDialogClose,
//   ResponsiveDialogContent,
//   ResponsiveDialogDescription,
//   ResponsiveDialogFooter,
//   ResponsiveDialogHeader,
//   ResponsiveDialogTitle,
//   ResponsiveDialogTrigger,
// } from "@/components/ui/responsive-dialog"
//
// <ResponsiveDialog>
//   <ResponsiveDialogTrigger asChild>
//     <button>Open modal</button>
//   </ResponsiveDialogTrigger>
//   <ResponsiveDialogContent>
//     <ResponsiveDialogHeader>
//       <ResponsiveDialogTitle>ResponsiveDialog</ResponsiveDialogTitle>
//       <ResponsiveDialogDescription>
//         A responsive modal component for shadcn/ui.
//       </ResponsiveDialogDescription>
//     </ResponsiveDialogHeader>
//     <ResponsiveDialogBody>
//       This component is built using shadcn/ui&apos;s dialog and drawer
//       component, which is built on top of Vaul.
//     </ResponsiveDialogBody>
//     <ResponsiveDialogFooter>
//       <ResponsiveDialogClose asChild>
//         <button>Close</button>
//       </ResponsiveDialogClose>
//     </ResponsiveDialogFooter>
//   </ResponsiveDialogContent>
// </ResponsiveDialog>

"use client"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "usehooks-ts"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"

const desktop = "(min-width: 768px)"

const ResponsiveDialog = ({ children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialog = isDesktop ? Dialog : Drawer

  return <ResponsiveDialog {...props}>{children}</ResponsiveDialog>
}

const ResponsiveDialogTrigger = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogTrigger = isDesktop ? DialogTrigger : DrawerTrigger

  return (
    <ResponsiveDialogTrigger className={className} {...props}>
      {children}
    </ResponsiveDialogTrigger>
  )
}

const ResponsiveDialogClose = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogClose = isDesktop ? DialogClose : DrawerClose

  return (
    <ResponsiveDialogClose className={className} {...props}>
      {children}
    </ResponsiveDialogClose>
  )
}

const ResponsiveDialogContent = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogContent = isDesktop ? DialogContent : DrawerContent

  return (
    <ResponsiveDialogContent className={className} {...props}>
      {children}
    </ResponsiveDialogContent>
  )
}

const ResponsiveDialogDescription = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogDescription = isDesktop ? DialogDescription : DrawerDescription

  return (
    <ResponsiveDialogDescription className={className} {...props}>
      {children}
    </ResponsiveDialogDescription>
  )
}

const ResponsiveDialogHeader = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogHeader = isDesktop ? DialogHeader : DrawerHeader

  return (
    <ResponsiveDialogHeader className={className} {...props}>
      {children}
    </ResponsiveDialogHeader>
  )
}

const ResponsiveDialogTitle = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogTitle = isDesktop ? DialogTitle : DrawerTitle

  return (
    <ResponsiveDialogTitle className={className} {...props}>
      {children}
    </ResponsiveDialogTitle>
  )
}

const ResponsiveDialogBody = ({ className, children, ...props }) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  )
}

const ResponsiveDialogFooter = ({ className, children, ...props }) => {
  const isDesktop = useMediaQuery(desktop)
  const ResponsiveDialogFooter = isDesktop ? DialogFooter : DrawerFooter

  return (
    <ResponsiveDialogFooter className={className} {...props}>
      {children}
    </ResponsiveDialogFooter>
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
  ResponsiveDialogFooter
}
