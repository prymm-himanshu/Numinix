import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChapterDiagnosticTest } from './ChapterDiagnosticTest';
import { EnhancedMathMap } from './EnhancedMathMap';
import { ProgressTrackingService, ChapterDiagnostic } from '../../services/progressTrackingService';
import chaptersData from '../../data/chapters.json';

export function MathMap() {
}