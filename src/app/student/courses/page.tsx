import React from 'react';
import { connection } from 'next/server';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { serializeDocument } from '@/lib/serialize';
import { ExternalLink, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default async function StudentCoursesPage() {
  await connection();
  await connectDB();
  const rawCourses = await Course.find({}).sort({ skillTag: 1, title: 1 }).lean();
  const courses = serializeDocument<any[]>(rawCourses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-dark-navy)]">
          Free Learning Resources & Courses
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Curated, 100% free high-quality tutorials and certifications to bridge your skill gaps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course._id || course.title}
            className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[var(--color-primary-blue)] font-bold">
                  {course.skillTag}
                </Badge>
                <span className="text-xs font-medium text-gray-400">{course.provider}</span>
              </div>

              <h3 className="line-clamp-2 text-base font-bold text-[var(--color-dark-navy)]">
                {course.title}
              </h3>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-success-green)]">
                <BookOpen className="h-3.5 w-3.5" />
                Free Course
              </span>

              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary-blue)] hover:underline"
              >
                <span>Start Learning</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
