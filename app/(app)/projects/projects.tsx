import { Project } from '@prisma/client'
import Link from 'next/link'

type ProjectListProps = {
  projects: Project[]
}

export const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>
          <Link href={`/projects/${project.id}`}>{project.name}</Link>
        </li>
      ))}
    </ul>
  )
}
