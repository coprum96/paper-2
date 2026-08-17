/**
 * Session Controller
 * Обработка запросов на сохранение игровых сессий
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { SessionData } from '../types/session';

/**
 * POST /api/sessions
 * Создаёт запись сессии и все связанные данные (ответы, выборы, тесты, просмотры)
 */
export async function createSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const sessionData: SessionData = req.body;

    console.log(`📊 Получена сессия: ${sessionData.sessionId}`);

    // Важно: не используем interactive transaction с Supabase pooler,
    // т.к. это часто приводит к P2028 (Unable to start a transaction in the given time).
    const session = await prisma.session.upsert({
      where: { sessionId: sessionData.sessionId },
      update: {
        userId: sessionData.userId || null,
        startTime: new Date(sessionData.startTime),
        endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
        totalPlayTime: sessionData.totalPlayTime || 0,
        finalCoins: sessionData.finalCoins,
        finalWisdom: sessionData.finalWisdom,
        completedLevels: sessionData.completedLevels,
        achievements: sessionData.achievements,
        timePerLevel: sessionData.timePerLevel || {},
        rawJson: sessionData as any,
      },
      create: {
        sessionId: sessionData.sessionId,
        userId: sessionData.userId || null,
        startTime: new Date(sessionData.startTime),
        endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
        totalPlayTime: sessionData.totalPlayTime || 0,
        finalCoins: sessionData.finalCoins,
        finalWisdom: sessionData.finalWisdom,
        completedLevels: sessionData.completedLevels,
        achievements: sessionData.achievements,
        timePerLevel: sessionData.timePerLevel || {},
        rawJson: sessionData as any,
      },
    });

    // Replace strategy для дочерних таблиц при промежуточных sync
    await prisma.quizAnswer.deleteMany({ where: { sessionId: sessionData.sessionId } });
    await prisma.dialogueChoice.deleteMany({ where: { sessionId: sessionData.sessionId } });
    await prisma.testResult.deleteMany({ where: { sessionId: sessionData.sessionId } });
    await prisma.materialView.deleteMany({ where: { sessionId: sessionData.sessionId } });

    if (sessionData.quizAnswers && sessionData.quizAnswers.length > 0) {
      await prisma.quizAnswer.createMany({
        data: sessionData.quizAnswers.map(answer => ({
          sessionId: sessionData.sessionId,
          levelId: answer.levelId,
          questionIndex: answer.questionIndex,
          questionText: answer.questionText,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
          timestamp: new Date(answer.timestamp),
        }))
      });
      console.log(`  ✓ Сохранено ${sessionData.quizAnswers.length} ответов на викторины`);
    }

    if (sessionData.dialogueChoices && sessionData.dialogueChoices.length > 0) {
      await prisma.dialogueChoice.createMany({
        data: sessionData.dialogueChoices.map(choice => ({
          sessionId: sessionData.sessionId,
          levelId: choice.levelId,
          dialogueIndex: choice.dialogueIndex,
          characterName: choice.characterName,
          choiceText: choice.choiceText,
          wisdomChange: choice.wisdomChange,
          coinChange: choice.coinChange,
          timestamp: new Date(choice.timestamp),
        }))
      });
      console.log(`  ✓ Сохранено ${sessionData.dialogueChoices.length} выборов в диалогах`);
    }

    if (sessionData.testResults && sessionData.testResults.length > 0) {
      await prisma.testResult.createMany({
        data: sessionData.testResults.map(result => ({
          sessionId: sessionData.sessionId,
          testType: result.testType,
          score: result.score,
          totalQuestions: result.totalQuestions,
          rawAnswers: result.answers,
          timestamp: new Date(result.timestamp),
        }))
      });
      console.log(`  ✓ Сохранено ${sessionData.testResults.length} результатов тестов`);
    }

    if (sessionData.materialViews && sessionData.materialViews.length > 0) {
      await prisma.materialView.createMany({
        data: sessionData.materialViews.map(view => ({
          sessionId: sessionData.sessionId,
          materialId: view.materialId,
          materialTitle: view.materialTitle,
          viewDuration: view.viewDuration,
          timestamp: new Date(view.timestamp),
        }))
      });
      console.log(`  ✓ Сохранено ${sessionData.materialViews.length} просмотров материалов`);
    }

    console.log(`✅ Сессия ${sessionData.sessionId} успешно синхронизирована`);

    res.status(201).json({
      status: 'ok',
      message: 'Session synchronized successfully',
      sessionId: session.sessionId,
      id: session.id
    });

  } catch (error) {
    console.error('❌ Ошибка сохранения сессии:', error);
    next(error);
  }
}

/**
 * GET /api/sessions/:sessionId
 * Возвращает последнюю синхронизированную версию сессии
 */
export async function getSessionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'sessionId parameter is required'
      });
    }

    const session = await prisma.session.findUnique({
      where: { sessionId },
      include: {
        quizAnswers: true,
        dialogueChoices: true,
        testResults: true,
        materialViews: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Session ${sessionId} not found`,
      });
    }

    return res.status(200).json({
      status: 'ok',
      sessionId: session.sessionId,
      updatedAt: session.updatedAt,
      finalCoins: session.finalCoins,
      finalWisdom: session.finalWisdom,
      completedLevels: session.completedLevels,
      counts: {
        quizAnswers: session.quizAnswers.length,
        dialogueChoices: session.dialogueChoices.length,
        testResults: session.testResults.length,
        materialViews: session.materialViews.length,
      },
      session,
    });
  } catch (error) {
    console.error('❌ Ошибка получения сессии:', error);
    next(error);
  }
}


