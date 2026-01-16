import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCourse } from '@/app/api/courses/actions'
import { EvaluationForm } from '@/app/components/evaluations/evaluation-form'
import { ArrowLeft } from 'lucide-react'

export default async function NewEvaluationPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: course, error } = await getCourse(id)

    if (error || !course) {
        notFound()
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/teacher/courses/${course.id}/evaluations`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Nueva Evaluación</h1>
                    <p className="text-muted-foreground">{course.name}</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Crear Evaluación</CardTitle>
                    <CardDescription>
                        Configura los detalles de la evaluación y el nivel de protección anti-IA
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EvaluationForm courseId={course.id} />
                </CardContent>
            </Card>
        </div>
    )
}