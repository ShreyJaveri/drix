"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Sparkles, Move, Box } from "lucide-react";

import { InsertTab } from "./InsertTab"; 
import { DesignTab } from "./DesignTab";
import { MagicTab } from "./MagicTab";
import { MotionTab } from "./MotionTab";

interface StyleMap {
  [key: string]: string;
}

interface PropertiesPanelProps {
  isEditMode: boolean;
  selectedTag: string | null;
  selectedStyles: StyleMap;
  selectedContent: string;
  editState: "normal" | "hover";
  setEditState: (state: "normal" | "hover") => void;
  onUpdateStyle: (prop: string, value: string, state: "normal" | "hover") => void;
  onUpdateContent: (text: string) => void;
  onDelete: () => void;
  onInsert: (html: string) => void;
  onAction?: (action: string, value?: string) => void;
  selectedDataset?: any;
}

export function PropertiesPanel({
  isEditMode,
  selectedTag,
  selectedStyles = {},
  selectedContent,
  editState,
  setEditState,
  onUpdateStyle,
  onUpdateContent,
  onDelete,
  onInsert,
  onAction,
  selectedDataset = {}
}: PropertiesPanelProps) {

  if (!isEditMode) return null;

  return (
    <div className="w-80 bg-white border-l h-full flex flex-col shrink-0 animate-in slide-in-from-right-5 duration-200 z-20 shadow-2xl">
      
      <Tabs defaultValue="design" className="h-full flex flex-col">
        <div className="border-b px-2 pt-2 bg-slate-50/50 shrink-0">
            <TabsList className="w-full grid grid-cols-4 bg-slate-200/50 p-1 h-9">
                <TabsTrigger value="design" className="text-[10px] h-7"><Layout className="h-3 w-3"/></TabsTrigger>
                <TabsTrigger value="magic" className="text-[10px] h-7"><Sparkles className="h-3 w-3 text-purple-500"/></TabsTrigger>
                <TabsTrigger value="motion" className="text-[10px] h-7"><Move className="h-3 w-3 text-blue-500"/></TabsTrigger>
                <TabsTrigger value="insert" className="text-[10px] h-7"><Box className="h-3 w-3"/></TabsTrigger>
            </TabsList>
        </div>

        {/* --- TAB: DESIGN --- */}
        <TabsContent value="design" className="flex-1 overflow-y-auto m-0 p-0 min-h-0 data-[state=inactive]:hidden">
            <DesignTab 
                selectedTag={selectedTag}
                selectedStyles={selectedStyles}
                selectedContent={selectedContent}
                editState={editState}
                setEditState={setEditState}
                onUpdateStyle={onUpdateStyle}
                onUpdateContent={onUpdateContent}
                onDelete={onDelete}
                onAction={onAction}
            />
        </TabsContent>

        {/* --- TAB: MAGIC --- */}
        <TabsContent value="magic" className="flex-1 overflow-y-auto m-0 p-0 min-h-0 data-[state=inactive]:hidden">
            <MagicTab 
                selectedTag={selectedTag}
                selectedStyles={selectedStyles}
                onUpdateStyle={onUpdateStyle}
                editState={editState}
            />
        </TabsContent>

        {/* --- TAB: MOTION --- */}
        <TabsContent value="motion" className="flex-1 overflow-y-auto m-0 p-0 min-h-0 data-[state=inactive]:hidden">
            <MotionTab 
                selectedTag={selectedTag}
                selectedStyles={selectedStyles}
                onUpdateStyle={onUpdateStyle}
                editState={editState}
            />
        </TabsContent>

        {/* --- TAB: INSERT --- */}
        <TabsContent value="insert" className="flex-1 overflow-y-auto m-0 p-0 min-h-0 data-[state=inactive]:hidden">
             <InsertTab onInsert={onInsert} />
        </TabsContent>
      </Tabs>
    </div>
  );
}