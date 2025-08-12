"use client"

export function Decor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft radial glows that gently brighten and scale on hover via parent .group */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 dark:opacity-25 transform transition duration-700 ease-out group-hover:opacity-40 group-hover:scale-110 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.45),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.35),transparent_60%)]" />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25 dark:opacity-20 transform transition duration-700 ease-out group-hover:opacity-35 group-hover:scale-110 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.45),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.3),transparent_60%)]" />

      {/* Subtle grid with dark-mode tone + radial mask */}
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  )
}
