import { useState } from 'react';
import { sendUserTestMessage } from '../utils/api';

export default function useGPT() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [streaming, setStreaming] = useState(false);

  async function ask({ userTestId, stepIndex, optionKey, openText, onChunk, onComplete }) {
    setLoading(true);
    setStreaming(true);
    setResponse('');

    try {
      // Use the conversation endpoint for GPT interaction
      const result = await sendUserTestMessage({
        userTestId,
        stepIndex,
        optionKey,
        openText
      });

      // Handle the GPT reply from backend
      if (result.gptReply) {
        setResponse(result.gptReply);
        
        // Simulate streaming for better UX
        if (onChunk) {
          let accumulatedText = '';
          const words = result.gptReply.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            accumulatedText += (i === 0 ? '' : ' ') + words[i];
            onChunk(words[i], accumulatedText);
            
            // Small delay to simulate streaming
            if (i < words.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 30));
            }
          }
        }
        
        onComplete?.(result.gptReply);
      }
      
      // Return complete result including next phase info
      return { 
        text: result.gptReply || '', 
        nextPhase: result.nextPhase,
        phase: result.phase,
        rating: result.gptRating
      };
    } catch (error) {
      console.error('GPT API error:', error);
      throw error;
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  function clearResponse() {
    setResponse(null);
  }

  return { 
    loading, 
    response, 
    streaming, 
    ask, 
    clearResponse 
  };
}