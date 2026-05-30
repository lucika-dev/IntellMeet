import * as React from "react"
import { cva } from "class-variance-authority"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max hover:scale-110 items-center justify-center rounded-2xl px-4.5 py-2.5 text-sm font-medium transition-all outline-none focus:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2}
        className="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 isolate z-50 w-full p-2.5 pr-3 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group-data-[viewport=false]/navigation-menu:top-full",
        "group-data-[viewport=false]/navigation-menu:mt-1.5",
        "group-data-[viewport=false]/navigation-menu:rounded-2xl",
        "group-data-[viewport=false]/navigation-menu:glass",
        "group-data-[viewport=false]/navigation-menu:text-popover-foreground",
        "group-data-[viewport=false]/navigation-menu:shadow-2xl",
        "group-data-[viewport=false]/navigation-menu:duration-300",
        "data-[motion=from-end]:slide-in-from-right-52",
        "data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52",
        "data-[motion=to-start]:slide-out-to-left-52",
        "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in",
        "data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
        "**:data-[slot=navigation-menu-link]:focus:ring-0",
        "**:data-[slot=navigation-menu-link]:focus:outline-none",
        "md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:data-open:animate-in",
        "group-data-[viewport=false]/navigation-menu:data-open:fade-in-0",
        "group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95",
        "group-data-[viewport=false]/navigation-menu:data-closed:animate-out",
        "group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0",
        "group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999,
    visibility: "hidden",
  })
  const [mounted, setMounted] = React.useState(false)

  React.useLayoutEffect(() => {
    setMounted(true)
  }, [])

  React.useLayoutEffect(() => {
    if (!mounted || !anchorRef.current) return

    const compute = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      setStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        zIndex: 9999,
        visibility: "visible",
      })
    }

    compute()

    const ro = new ResizeObserver(compute)
    ro.observe(document.documentElement)
    window.addEventListener("scroll", compute, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", compute)
    }
  }, [mounted])

  const viewport = (
    <div style={style}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "glass",
          "origin-top-center relative mt-1.5 rounded-2xl shadow-2xl",
          "h-(--radix-navigation-menu-viewport-height)",
          "w-full md:w-(--radix-navigation-menu-viewport-width)",
          "data-open:animate-in data-open:zoom-in-95 data-open:fade-in-0",
          "data-closed:animate-out data-closed:zoom-out-95 data-closed:fade-out-0",
          "duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "will-change-[height,width]",
          className
        )}
        {...props}
      />
    </div>
  )

  if (!mounted) return <div ref={anchorRef} className="absolute top-full left-0 w-full" />

  return (
    <>
      <div ref={anchorRef} className="absolute top-full left-0 w-full" />
      {createPortal(viewport, document.body)}
    </>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-1.5 rounded-2xl p-3 text-sm transition-all outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
        "in-data-[slot=navigation-menu-content]:rounded-xl",
        "data-[active=true]:bg-foreground/10",
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
        "data-[state=hidden]:animate-out data-[state=hidden]:fade-out",
        "data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}