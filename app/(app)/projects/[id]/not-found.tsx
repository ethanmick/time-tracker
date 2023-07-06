import Link from 'next/link'

export default function ProjectNotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find that project.</p>
      <p>
        View <Link href="/projects">all projects</Link>.
      </p>
    </div>
  )
}
