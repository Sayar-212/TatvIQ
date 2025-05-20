import json
import logging
import requests
from typing import Dict, Any, List
from google import genai

logger = logging.getLogger(__name__)

def call_gemini_api(prompt: str, api_key: str) -> Dict[str, Any]:
    """
    Make a request to the Google Gemini API
    
    Args:
        prompt (str): The prompt text to send to the API
        api_key (str): Gemini API key
        
    Returns:
        Dict[str, Any]: JSON response from the API
    """
    try:
        # Due to API limitations, we're providing mock responses for demonstration
        logger.info(f"Processing prompt: {prompt[:50]}...")
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content (
            model="gemini-2.0-flash",
            contents=prompt
        )

        return response
        # Create a structured mock response based on the prompt context
        if "resume" in prompt.lower():
            return {
                "candidates": [
                    {
                        "output": """
                        {
                          "extracted_skills": ["Python", "JavaScript", "React", "Flask", "SQL", "AWS", "Git"],
                          "matching_skills": ["Python", "JavaScript", "React", "SQL"],
                          "missing_skills": ["Docker", "CI/CD", "Agile"],
                          "experience_summary": "3 years of software development experience with focus on web applications",
                          "education_summary": "Bachelor's degree in Computer Science",
                          "match_score": 78,
                          "strengths": ["Strong frontend skills", "Good database knowledge", "Problem-solving abilities"],
                          "weaknesses": ["Limited DevOps experience", "No cloud certification", "Needs more team leadership experience"],
                          "overall_assessment": "Good candidate with solid technical skills matching most requirements. Some gaps in DevOps and cloud experience that may require training."
                        }
                        """
                    }
                ]
            }
        elif "feedback" in prompt.lower() or "sentiment" in prompt.lower():
            return {
                "candidates": [
                    {
                        "output": """
                        {
                          "sentiment_score": 0.25,
                          "primary_sentiment": "Mixed",
                          "key_themes": ["Work-life balance", "Team collaboration", "Career growth", "Compensation"],
                          "positive_aspects": ["Supportive team environment", "Interesting projects", "Learning opportunities"],
                          "concerns": ["High workload", "Limited advancement opportunities", "Communication issues with management"],
                          "attrition_risk": {
                            "level": "medium",
                            "reasoning": "Employee shows signs of dissatisfaction with growth opportunities and workload, but appreciates team and projects"
                          },
                          "engagement_recommendations": ["Address work-life balance concerns", "Provide clearer career path", "Improve management communication", "Consider compensation review"],
                          "summary": "Employee shows mixed satisfaction levels with positive feelings toward team and work content but concerns about workload and advancement."
                        }
                        """
                    }
                ]
            }
        else:
            return {
                "candidates": [
                    {
                        "output": "Could not parse the request type. Please specify either resume analysis or sentiment analysis."
                    }
                ]
            }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API request error: {str(e)}")
        raise Exception(f"Failed to call Gemini API: {str(e)}")
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise Exception(f"Failed to parse API response: {str(e)}")

def analyze_resume_with_gemini(resume_text: str, job_description: str, api_key: str) -> Dict[str, Any]:
    """
    Analyze resume text against job description using Gemini API
    
    Args:
        resume_text (str): Extracted text from resume
        job_description (str): Job description text
        api_key (str): Gemini API key
        
    Returns:
        Dict[str, Any]: Structured analysis result
    """
    try:
        prompt = f"""
        You are an expert HR recruiter specializing in tech roles with 15+ years of experience in technical hiring. Analyze the resume below for a Software Engineer position with precision and depth.

        JOB DESCRIPTION:
        {job_description}

        RESUME:
        {resume_text}

        Few-shot examples to guide your analysis:

        Example 1:
        For a resume with extensive Java experience but missing cloud skills:
        ```json
        {{
        "extracted_skills": ["Java", "Spring Boot", "SQL", "Git", "Agile"],
        "matching_skills": ["Java", "SQL", "Git"],
        "missing_skills": ["AWS", "Docker", "Kubernetes", "Microservices"],
        "experience_summary": "5 years of Java development with focus on backend services and monolithic applications",
        "education_summary": "BS in Computer Science from State University, graduated 2018",
        "match_score": 65,
        "strengths": ["Strong Java fundamentals", "Database expertise", "Solid software engineering practices"],
        "weaknesses": ["No cloud experience", "Limited exposure to microservices architecture", "No CI/CD pipeline experience"],
        "overall_assessment": "Solid Java developer with good fundamentals but lacking modern cloud-native development experience required for this role. Would need significant upskilling in containerization and cloud services."
        }}
        ```

        Example 2:
        For a resume with strong cloud skills but limited experience:
        ```json
        {{
        "extracted_skills": ["Python", "AWS Lambda", "DynamoDB", "Docker", "Kubernetes", "CI/CD", "React"],
        "matching_skills": ["AWS", "Python", "Docker", "CI/CD"],
        "missing_skills": ["Java", "5+ years experience"],
        "experience_summary": "2 years of experience building serverless applications on AWS",
        "education_summary": "MS in Computer Engineering from Tech Institute, graduated 2022",
        "match_score": 75,
        "strengths": ["Strong cloud-native development skills", "Full-stack capabilities", "Modern tech stack"],
        "weaknesses": ["Less experience than required", "Missing primary language (Java) for the role"],
        "overall_assessment": "Promising candidate with excellent cloud skills but less experience than required. Strong technical foundation makes them a good investment despite the experience gap."
        }}
        ```

        Provide a JSON response with the following structure:
        1. extracted_skills (array): List of all technical skills found in the resume (languages, frameworks, tools, platforms)
        2. matching_skills (array): Skills from the resume that directly match requirements in the job description
        3. missing_skills (array): Important skills mentioned in the job description but missing from the resume
        4. experience_summary (string): Brief summary of the candidate's relevant experience (years, roles, achievements)
        5. education_summary (string): Brief summary of the candidate's education (degrees, institutions, relevant certifications)
        6. match_score (number): A score from 0-100 indicating how well the resume matches the job description (consider skills, experience level, and role alignment)
        7. strengths (array): Key strengths of the candidate relevant to this specific role
        8. weaknesses (array): Areas where the candidate may need improvement or doesn't meet requirements
        9. overall_assessment (string): A concise overall assessment of the candidate's fit for the role (2-3 sentences)

        IMPORTANT ANALYSIS GUIDELINES:
        1. Be thorough in skill extraction, including both explicitly stated and implied skills
        2. Consider both technical and soft skills in your evaluation
        3. When calculating match score, weight critical requirements higher than nice-to-have skills
        4. For experience with technologies, consider both years of experience and depth of usage
        5. Identify transferable skills that might compensate for missing requirements
        6. Consider career progression and growth trajectory in your assessment
        7. Be objective and avoid bias based on company names or educational institutions
        8. Dont use "The candidate" use his/her name.

        Format your response as a valid JSON object with these keys.
        """
        
        response = call_gemini_api(prompt, api_key)
        print(response.text)
        result = json.loads(response.text.strip('`').lstrip('json\n'))
        return result   
            # Extract the JSON from the response
            # text_response = response['candidates'][0]['output']
            
            # Find JSON content (between curly braces)
            # json_start = text_response.find('{')
            # json_end = text_response.rfind('}') + 1
            
            # if json_start >= 0 and json_end > json_start:
            #     json_str = text_response[json_start:json_end]
            #     return json.loads(json_str)
            # else:
            #     # If JSON parsing fails, create a structured response from the text
            #     logger.warning("Could not extract JSON from API response, creating structured response")
            #     return {
            #         "extracted_skills": [],
            #         "matching_skills": [],
            #         "missing_skills": [],
            #         "experience_summary": "Could not extract experience summary",
            #         "education_summary": "Could not extract education summary",
            #         "match_score": 0,
            #         "strengths": [],
            #         "weaknesses": [],
            #         "overall_assessment": text_response
            #     }
            
    except Exception as e:
        logger.error(f"Resume analysis error: {str(e)}")
        raise Exception(f"Failed to analyze resume: {str(e)}")

def analyze_sentiment_with_gemini(feedback_text: str, api_key: str) -> Dict[str, Any]:
    """
    Analyze employee feedback for sentiment using Gemini API
    
    Args:
        feedback_text (str): Employee feedback text
        api_key (str): Gemini API key
        
    Returns:
        Dict[str, Any]: Structured sentiment analysis result
    """
    try:
        prompt = f"""
        You are an expert HR analyst specializing in employee engagement and retention with 12+ years of experience in workplace analytics. Analyze the following employee feedback text with nuance and psychological insight:
        
        EMPLOYEE FEEDBACK:
        {feedback_text}
        
        Few-shot examples to guide your analysis:

        Example 1:
        For feedback showing mixed sentiment with concerns about workload:
        ```json
        {{
          "sentiment_score": -0.2,
          "primary_sentiment": "mixed",
          "key_themes": ["Work-life balance", "Team collaboration", "Career development", "Workload management"],
          "positive_aspects": ["Supportive team environment", "Learning opportunities", "Interesting projects"],
          "concerns": ["Excessive overtime expectations", "Understaffing", "Burnout risk", "Unclear promotion criteria"],
          "attrition_risk": {{
            "level": "medium",
            "reasoning": "Despite enjoying team dynamics and learning opportunities, the employee shows signs of burnout and frustration with workload distribution that could lead to departure if not addressed"
          }},
          "engagement_recommendations": [
            "Conduct workload assessment across the team",
            "Implement clearer boundaries for after-hours work expectations",
            "Create more transparent promotion pathways",
            "Consider additional headcount for overloaded functions"
          ],
          "summary": "This employee shows appreciation for their colleagues and growth opportunities but is struggling with unsustainable workload demands. Attention to resource allocation and work-life boundaries would likely improve retention prospects significantly."
        }}
        ```

        Example 2:
        For predominantly positive feedback with minor concerns:
        ```json
        {{
          "sentiment_score": 0.7,
          "primary_sentiment": "positive",
          "key_themes": ["Leadership", "Company culture", "Recognition", "Innovation"],
          "positive_aspects": ["Supportive management", "Recognition of contributions", "Collaborative atmosphere", "Meaningful work"],
          "concerns": ["Limited remote work flexibility", "Communication gaps between departments"],
          "attrition_risk": {{
            "level": "low",
            "reasoning": "Employee expresses strong alignment with company values and appreciation for leadership style, with only minor operational concerns that don't appear to outweigh positive aspects"
          }},
          "engagement_recommendations": [
            "Consider expanding remote work options",
            "Implement cross-department communication channels",
            "Continue recognition practices that are working well"
          ],
          "summary": "This employee shows high engagement and satisfaction with the company culture and leadership approach. Addressing minor concerns about work flexibility and interdepartmental communication would further strengthen an already positive employment relationship."
        }}
        ```

        Example 3:
        For predominantly negative feedback indicating high attrition risk:
        ```json
        {{
          "sentiment_score": -0.8,
          "primary_sentiment": "negative",
          "key_themes": ["Compensation", "Management style", "Respect", "Career stagnation"],
          "positive_aspects": ["Technical skills developed", "Some helpful colleagues"],
          "concerns": ["Feeling undervalued", "Below-market compensation", "Micromanagement", "Toxic leadership behaviors", "Lack of growth opportunities"],
          "attrition_risk": {{
            "level": "high",
            "reasoning": "Employee expresses multiple serious concerns affecting daily work experience, uses language suggesting active job searching, and identifies few redeeming factors about current role"
          }},
          "engagement_recommendations": [
            "Urgent compensation review and adjustment if warranted",
            "Leadership coaching for direct managers",
            "Create immediate growth plan with clear milestones",
            "Establish psychological safety in team environment"
          ],
          "summary": "This employee is highly disengaged and likely actively seeking other employment. Multiple core issues around respect, compensation, and management approach require immediate intervention for any chance of retention. Even with changes, rebuilding trust may be challenging."
        }}
        ```
        
        Provide a JSON response with the following structure:
        1. sentiment_score (number): Overall sentiment score from -1.0 (very negative) to 1.0 (very positive)
        2. primary_sentiment (string): The primary sentiment detected (e.g., "positive", "negative", "neutral", "mixed")
        3. key_themes (array): List of key themes/topics identified in the feedback
        4. positive_aspects (array): Positive aspects mentioned in the feedback
        5. concerns (array): Concerns or issues mentioned in the feedback
        6. attrition_risk (object): 
           - level (string): Risk level ("low", "medium", "high")
           - reasoning (string): Brief explanation for the risk assessment
        7. engagement_recommendations (array): Specific recommendations to improve engagement based on the feedback
        8. summary (string): Brief summary of the feedback analysis
        
        IMPORTANT ANALYSIS GUIDELINES:
        1. Look beyond surface sentiment to identify underlying emotional patterns and concerns
        2. Pay special attention to language indicating intention to leave (e.g., "not worth it anymore," "looking for other options")
        3. Consider the intensity and repetition of concerns as indicators of their importance
        4. Balance positive and negative elements when determining overall sentiment score
        5. Make recommendations that are specific and actionable rather than generic
        6. Identify subtle indicators of disengagement that might not be explicitly stated
        7. Consider how long-standing issues versus recent changes might impact retention differently
        8. Look for mentions of competitors or industry standards as benchmarking references
        9. Note any conditional language ("if this doesn't change...") as potential retention leverage points

        Format your response as a valid JSON object with these keys.
        """
        
        response = call_gemini_api(prompt, api_key)

        return json.loads(response.text.strip('`').lstrip('json\n'))
        
        # # Extract the JSON from the response
        # text_response = response['candidates'][0]['output']
        
        # # Find JSON content (between curly braces)
        # json_start = text_response.find('{')
        # json_end = text_response.rfind('}') + 1
        
        # if json_start >= 0 and json_end > json_start:
        #     json_str = text_response[json_start:json_end]
        #     return json.loads(json_str)
        # else:
        #     # If JSON parsing fails, create a structured response from the text
        #     logger.warning("Could not extract JSON from API response, creating structured response")
        #     return {
        #         "sentiment_score": 0,
        #         "primary_sentiment": "unknown",
        #         "key_themes": [],
        #         "positive_aspects": [],
        #         "concerns": [],
        #         "attrition_risk": {
        #             "level": "unknown",
        #             "reasoning": "Could not determine risk level"
        #         },
        #         "engagement_recommendations": [],
        #         "summary": text_response
        #     }
            
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        raise Exception(f"Failed to analyze sentiment: {str(e)}")
