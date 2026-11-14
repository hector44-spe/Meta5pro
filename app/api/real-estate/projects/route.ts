import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { OPEN_REAL_ESTATE_PROJECTS, RealEstateProject } from "@/data/realEstateData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const setting = await prisma.appSetting.findUnique({
      where: { key: "real_estate_projects" },
    });

    let projects: RealEstateProject[] = OPEN_REAL_ESTATE_PROJECTS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      projects = setting.value as unknown as RealEstateProject[];
    }

    return NextResponse.json({
      success: true,
      projects,
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch real estate projects error:", error);
    return NextResponse.json({
      success: true,
      projects: OPEN_REAL_ESTATE_PROJECTS,
      isAdmin: false,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required to edit estate projects" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, project, projectId } = body;

    const setting = await prisma.appSetting.findUnique({
      where: { key: "real_estate_projects" },
    });

    let currentProjects: RealEstateProject[] = OPEN_REAL_ESTATE_PROJECTS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      currentProjects = setting.value as unknown as RealEstateProject[];
    }

    let updatedProjects: RealEstateProject[];

    if (action === "delete") {
      updatedProjects = currentProjects.filter((p) => p.id !== (projectId || project?.id));
    } else {
      if (!project || !project.id) {
        return NextResponse.json({ error: "Invalid project data" }, { status: 400 });
      }
      const exists = currentProjects.some((p) => p.id === project.id);
      if (exists) {
        updatedProjects = currentProjects.map((p) =>
          p.id === project.id ? { ...p, ...project } : p
        );
      } else {
        updatedProjects = [...currentProjects, project];
      }
    }

    await prisma.appSetting.upsert({
      where: { key: "real_estate_projects" },
      create: {
        key: "real_estate_projects",
        value: updatedProjects as any,
        updatedBy: session.userId,
      },
      update: {
        value: updatedProjects as any,
        updatedBy: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      projects: updatedProjects,
      message: action === "delete" ? "Project deleted successfully" : "Project updated successfully",
    });
  } catch (error) {
    console.error("Update real estate project error:", error);
    return NextResponse.json(
      { error: "Failed to save project updates" },
      { status: 500 }
    );
  }
}
