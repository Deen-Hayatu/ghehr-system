#!/usr/bin/env python3
"""
Ghana Ministry of Health Website Scraper
Scrapes https://www.moh.gov.gh/ for relevant information to assist in EHR development
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import logging
from urllib.parse import urljoin, urlparse
from datetime import datetime
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('moh_scraper.log'),
        logging.StreamHandler()
    ]
)

class MOHScraper:
    def __init__(self):
        self.base_url = "https://www.moh.gov.gh/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.scraped_data = {
            'health_policies': [],
            'healthcare_facilities': [],
            'health_programs': [],
            'publications': [],
            'news_updates': [],
            'contact_info': [],
            'departments': [],
            'ehr_relevant_links': []
        }
        self.discovered_links = []
    
    def get_page(self, url):
        """Fetch a web page with error handling"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            logging.error(f"Error fetching {url}: {e}")
            return None
    
    def scrape_main_page(self):
        """Scrape the main page for overview information and discover actual URLs"""
        logging.info("Scraping main page...")
        soup = self.get_page(self.base_url)
        if not soup:
            return
        
        # Store all discovered links for later use
        self.discovered_links = []
        
        # Extract ALL links from the page
        all_links = soup.find_all('a', href=True)
        for link in all_links:
            href = urljoin(self.base_url, link['href'])
            text = link.get_text(strip=True)
            
            # Store all links for analysis
            self.discovered_links.append({
                'text': text,
                'url': href,
                'category': self.categorize_link(text, href)
            })
            
            # Log relevant health-related links
            if text and any(keyword in text.lower() for keyword in 
                          ['health', 'policy', 'hospital', 'clinic', 'service', 'program', 'department']):
                logging.info(f"Found relevant link: {text} -> {href}")
    
    def categorize_link(self, text, url):
        """Categorize links based on text and URL patterns"""
        text_lower = text.lower()
        url_lower = url.lower()
        
        if any(keyword in text_lower for keyword in ['policy', 'guideline', 'document', 'publication']):
            return 'policy'
        elif any(keyword in text_lower for keyword in ['hospital', 'clinic', 'facility', 'center']):
            return 'facility'
        elif any(keyword in text_lower for keyword in ['program', 'initiative', 'service']):
            return 'program'
        elif any(keyword in text_lower for keyword in ['news', 'update', 'announcement', 'press']):
            return 'news'
        elif any(keyword in text_lower for keyword in ['contact', 'about', 'department']):
            return 'contact'
        else:
            return 'other'
    
    def scrape_health_policies(self):
        """Scrape health policies and guidelines using discovered links"""
        logging.info("Scraping health policies...")
        
        # Use discovered links instead of guessing URLs
        policy_links = [link for link in getattr(self, 'discovered_links', []) 
                       if link['category'] == 'policy']
        
        # Also try some common patterns from the discovered links
        if hasattr(self, 'discovered_links'):
            for link in self.discovered_links:
                url = link['url']
                text = link['text'].lower()
                
                # Visit pages that might contain policy information
                if any(keyword in text for keyword in ['policy', 'guideline', 'document', 'publication', 'standard']):
                    soup = self.get_page(url)
                    if soup:
                        self.extract_policy_documents(soup, url)
    
    def extract_policy_documents(self, soup, source_url):
        """Extract policy documents from a page"""
        # Look for downloadable documents (PDFs, DOCs)
        doc_links = soup.find_all('a', href=True)
        for link in doc_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Check if it's a document link
            if any(ext in href.lower() for ext in ['.pdf', '.doc', '.docx']) or \
               any(keyword in text.lower() for keyword in ['policy', 'guideline', 'standard', 'protocol', 'document']):
                
                doc_url = urljoin(source_url, href)
                self.scraped_data['health_policies'].append({
                    'title': text,
                    'url': doc_url,
                    'source_page': source_url,
                    'scraped_at': datetime.now().isoformat()
                })
                logging.info(f"Found policy document: {text} -> {doc_url}")
        
        # Look for policy content directly on the page
        policy_sections = soup.find_all(['div', 'section', 'article'], 
                                       text=lambda x: x and any(keyword in x.lower() 
                                       for keyword in ['policy', 'guideline', 'standard']))
        
        for section in policy_sections:
            title_elem = section.find(['h1', 'h2', 'h3', 'h4', 'h5'])
            if title_elem:
                title = title_elem.get_text(strip=True)
                content = section.get_text(strip=True)[:500]  # First 500 chars
                
                self.scraped_data['health_policies'].append({
                    'title': title,
                    'content_preview': content,
                    'url': source_url,
                    'scraped_at': datetime.now().isoformat()
                })
    
    def scrape_healthcare_facilities(self):
        """Scrape information about healthcare facilities using discovered links"""
        logging.info("Scraping healthcare facilities...")
        
        # Use discovered links for facility information
        if hasattr(self, 'discovered_links'):
            for link in self.discovered_links:
                url = link['url']
                text = link['text'].lower()
                
                # Visit pages that might contain facility information
                if any(keyword in text for keyword in ['hospital', 'clinic', 'facility', 'center', 'health']):
                    soup = self.get_page(url)
                    if soup:
                        self.extract_facility_info(soup, url)
    
    def extract_facility_info(self, soup, source_url):
        """Extract facility information from a page"""
        # Look for facility listings or information
        facility_sections = soup.find_all(['div', 'section', 'article', 'li'])
        
        for section in facility_sections:
            facility_info = {
                'name': '',
                'location': '',
                'contact': '',
                'services': [],
                'source_url': source_url,
                'scraped_at': datetime.now().isoformat()
            }
            
            # Extract facility name
            name_elem = section.find(['h1', 'h2', 'h3', 'h4', 'h5'])
            if name_elem:
                name_text = name_elem.get_text(strip=True)
                # Check if it looks like a facility name
                if any(keyword in name_text.lower() for keyword in 
                      ['hospital', 'clinic', 'center', 'polyclinic', 'medical']):
                    facility_info['name'] = name_text
            
            # Extract location information
            location_patterns = ['region', 'district', 'town', 'city', 'location', 'address']
            for pattern in location_patterns:
                location_elem = section.find(text=lambda x: x and pattern in x.lower())
                if location_elem:
                    facility_info['location'] = location_elem.strip()
                    break
            
            # Extract contact information
            contact_patterns = ['phone', 'tel', 'email', 'contact']
            for pattern in contact_patterns:
                contact_elem = section.find(text=lambda x: x and pattern in x.lower())
                if contact_elem:
                    facility_info['contact'] = contact_elem.strip()
                    break
            
            # Extract services
            services_elem = section.find(text=lambda x: x and 'service' in x.lower())
            if services_elem:
                # Simple extraction of services mentioned
                services_text = services_elem.strip()
                facility_info['services'] = [services_text]
            
            # Only add if we found a name
            if facility_info['name']:
                self.scraped_data['healthcare_facilities'].append(facility_info)
                logging.info(f"Found facility: {facility_info['name']}")
    
    def scrape_health_programs(self):
        """Scrape health programs and initiatives using discovered links"""
        logging.info("Scraping health programs...")
        
        # Use discovered links for program information
        if hasattr(self, 'discovered_links'):
            for link in self.discovered_links:
                url = link['url']
                text = link['text'].lower()
                
                # Visit pages that might contain program information
                if any(keyword in text for keyword in ['program', 'initiative', 'service', 'project', 'health']):
                    soup = self.get_page(url)
                    if soup:
                        self.extract_program_info(soup, url)
    
    def extract_program_info(self, soup, source_url):
        """Extract program information from a page"""
        # Look for program content
        program_sections = soup.find_all(['div', 'section', 'article'])
        
        for section in program_sections:
            program_info = {
                'title': '',
                'description': '',
                'target_group': '',
                'objectives': [],
                'url': source_url,
                'scraped_at': datetime.now().isoformat()
            }
            
            # Extract program title
            title_elem = section.find(['h1', 'h2', 'h3', 'h4'])
            if title_elem:
                title_text = title_elem.get_text(strip=True)
                # Check if it looks like a program title
                if any(keyword in title_text.lower() for keyword in 
                      ['program', 'initiative', 'project', 'service', 'health', 'care']):
                    program_info['title'] = title_text
            
            # Extract description
            desc_paragraphs = section.find_all('p')
            if desc_paragraphs:
                descriptions = []
                for p in desc_paragraphs[:3]:  # First 3 paragraphs
                    desc_text = p.get_text(strip=True)
                    if desc_text and len(desc_text) > 20:  # Meaningful content
                        descriptions.append(desc_text)
                program_info['description'] = ' '.join(descriptions)
            
            # Extract objectives if present
            objectives_elem = section.find(text=lambda x: x and 'objective' in x.lower())
            if objectives_elem:
                # Look for list items near objectives
                parent = objectives_elem.parent if hasattr(objectives_elem, 'parent') else None
                if parent:
                    list_items = parent.find_all('li')
                    if list_items:
                        program_info['objectives'] = [li.get_text(strip=True) for li in list_items]
            
            # Only add if we found a title
            if program_info['title']:
                self.scraped_data['health_programs'].append(program_info)
                logging.info(f"Found program: {program_info['title']}")
    
    def scrape_news_and_updates(self):
        """Scrape news and updates using discovered links"""
        logging.info("Scraping news and updates...")
        
        # Use discovered links for news information
        if hasattr(self, 'discovered_links'):
            for link in self.discovered_links:
                url = link['url']
                text = link['text'].lower()
                
                # Visit pages that might contain news information
                if any(keyword in text for keyword in ['news', 'update', 'announcement', 'press', 'media']):
                    soup = self.get_page(url)
                    if soup:
                        self.extract_news_info(soup, url)
    
    def extract_news_info(self, soup, source_url):
        """Extract news information from a page"""
        # Look for news articles or updates
        news_sections = soup.find_all(['div', 'article', 'section'])
        
        for section in news_sections:
            news_info = {
                'title': '',
                'date': '',
                'summary': '',
                'url': source_url,
                'scraped_at': datetime.now().isoformat()
            }
            
            # Extract news title
            title_elem = section.find(['h1', 'h2', 'h3', 'h4'])
            if title_elem:
                news_info['title'] = title_elem.get_text(strip=True)
            
            # Extract date
            date_elem = section.find(class_=lambda x: x and 'date' in x.lower()) or \
                       section.find(text=lambda x: x and any(month in x.lower() for month in 
                                   ['january', 'february', 'march', 'april', 'may', 'june',
                                    'july', 'august', 'september', 'october', 'november', 'december']))
            if date_elem:
                if hasattr(date_elem, 'get_text'):
                    news_info['date'] = date_elem.get_text(strip=True)
                else:
                    news_info['date'] = str(date_elem).strip()
            
            # Extract summary
            summary_elem = section.find('p')
            if summary_elem:
                summary_text = summary_elem.get_text(strip=True)
                news_info['summary'] = summary_text[:300]  # First 300 characters
            
            # Only add if we found a title
            if news_info['title'] and len(news_info['title']) > 10:
                self.scraped_data['news_updates'].append(news_info)
                logging.info(f"Found news: {news_info['title'][:50]}...")
    
    def extract_contact_information(self):
        """Extract contact information and department details using discovered links"""
        logging.info("Extracting contact information...")
        
        # Use discovered links for contact information
        if hasattr(self, 'discovered_links'):
            for link in self.discovered_links:
                url = link['url']
                text = link['text'].lower()
                
                # Visit pages that might contain contact information
                if any(keyword in text for keyword in ['contact', 'about', 'department', 'office']):
                    soup = self.get_page(url)
                    if soup:
                        self.extract_contact_details(soup, url)
        
        # Also check the main page for contact info
        main_soup = self.get_page(self.base_url)
        if main_soup:
            self.extract_contact_details(main_soup, self.base_url)
    
    def extract_contact_details(self, soup, source_url):
        """Extract contact details from a page"""
        # Look for contact information patterns
        contact_patterns = {
            'phone': [r'\+233\s*\d+', r'\d{3}-\d{3}-\d{4}', r'\d{10}'],
            'email': [r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'],
            'address': ['box', 'p.o', 'street', 'road', 'avenue'],
            'fax': ['fax']
        }
        
        import re
        
        page_text = soup.get_text()
        
        for contact_type, patterns in contact_patterns.items():
            for pattern in patterns:
                if contact_type in ['phone', 'email']:
                    # Use regex for phone and email
                    matches = re.findall(pattern, page_text, re.IGNORECASE)
                    for match in matches:
                        self.scraped_data['contact_info'].append({
                            'type': contact_type,
                            'value': match.strip(),
                            'source_url': source_url,
                            'scraped_at': datetime.now().isoformat()
                        })
                        logging.info(f"Found {contact_type}: {match}")
                else:
                    # Use text search for address and fax
                    if pattern in page_text.lower():
                        # Find the line containing the pattern
                        lines = page_text.split('\n')
                        for line in lines:
                            if pattern in line.lower():
                                self.scraped_data['contact_info'].append({
                                    'type': contact_type,
                                    'value': line.strip(),
                                    'source_url': source_url,
                                    'scraped_at': datetime.now().isoformat()
                                })
                                logging.info(f"Found {contact_type}: {line.strip()}")
                                break
        
        # Look for department information
        dept_elements = soup.find_all(text=lambda x: x and 'department' in x.lower())
        for element in dept_elements:
            dept_text = str(element).strip()
            if len(dept_text) > 10 and len(dept_text) < 200:  # Reasonable length
                self.scraped_data['departments'].append({
                    'name': dept_text,
                    'source_url': source_url,
                    'scraped_at': datetime.now().isoformat()
                })
                logging.info(f"Found department: {dept_text}")
    
    def save_data(self):
        """Save scraped data to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save as JSON
        json_filename = f"moh_data_{timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data, f, indent=2, ensure_ascii=False)
        logging.info(f"Data saved to {json_filename}")
        
        # Save as CSV for each category
        for category, data in self.scraped_data.items():
            if data:
                csv_filename = f"moh_{category}_{timestamp}.csv"
                if isinstance(data[0], dict):
                    fieldnames = data[0].keys()
                    with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
                        writer = csv.DictWriter(f, fieldnames=fieldnames)
                        writer.writeheader()
                        writer.writerows(data)
                    logging.info(f"Category '{category}' saved to {csv_filename}")
    
    def generate_ehr_insights(self):
        """Generate insights for EHR development based on scraped data"""
        insights = {
            'regulatory_requirements': [],
            'facility_types': set(),
            'common_health_issues': [],
            'data_standards': [],
            'compliance_requirements': [],
            'discovered_sections': [],
            'ehr_relevant_links': [],
            'contact_summary': {},
            'recommendations': []
        }
        
        # Analyze policies for regulatory requirements
        for policy in self.scraped_data['health_policies']:
            title = policy.get('title', '').lower()
            if any(keyword in title for keyword in ['data', 'privacy', 'record', 'ehr', 'electronic', 'information']):
                insights['regulatory_requirements'].append(policy)
        
        # Extract facility types
        for facility in self.scraped_data['healthcare_facilities']:
            facility_name = facility.get('name', '').lower()
            if 'hospital' in facility_name:
                insights['facility_types'].add('hospital')
            elif 'clinic' in facility_name:
                insights['facility_types'].add('clinic')
            elif 'center' in facility_name:
                insights['facility_types'].add('health_center')
            elif 'polyclinic' in facility_name:
                insights['facility_types'].add('polyclinic')
        
        # Analyze health programs for common health issues
        health_keywords = ['malaria', 'diabetes', 'hypertension', 'maternal', 'child health', 
                          'tuberculosis', 'hiv', 'aids', 'immunization', 'nutrition']
        
        for program in self.scraped_data['health_programs']:
            description = program.get('description', '').lower()
            title = program.get('title', '').lower()
            content = f"{title} {description}"
            
            for keyword in health_keywords:
                if keyword in content:
                    insights['common_health_issues'].append({
                        'issue': keyword,
                        'program': program.get('title', ''),
                        'context': content[:200]
                    })
        
        # Analyze discovered links
        if hasattr(self, 'discovered_links'):
            link_categories = {}
            for link in self.discovered_links:
                category = link.get('category', 'other')
                if category not in link_categories:
                    link_categories[category] = []
                link_categories[category].append(link['text'])
            
            insights['discovered_sections'] = link_categories
        
        # Include EHR-relevant links
        if 'ehr_relevant_links' in self.scraped_data:
            insights['ehr_relevant_links'] = self.scraped_data['ehr_relevant_links']
        
        # Summarize contact information
        contact_types = {}
        for contact in self.scraped_data['contact_info']:
            contact_type = contact.get('type', 'unknown')
            if contact_type not in contact_types:
                contact_types[contact_type] = []
            contact_types[contact_type].append(contact.get('value', ''))
        
        insights['contact_summary'] = contact_types
        
        # Generate recommendations for EHR development
        recommendations = []
        
        if insights['facility_types']:
            recommendations.append(
                f"Design EHR to support {len(insights['facility_types'])} facility types: "
                f"{', '.join(insights['facility_types'])}"
            )
        
        if insights['common_health_issues']:
            top_issues = list(set([issue['issue'] for issue in insights['common_health_issues']]))[:5]
            recommendations.append(
                f"Include templates/modules for common health issues: {', '.join(top_issues)}"
            )
        
        if contact_types.get('phone'):
            recommendations.append("Integrate SMS/phone communication features for patient engagement")
        
        if contact_types.get('email'):
            recommendations.append("Include email notifications and communication features")
        
        # Add general recommendations
        recommendations.extend([
            "Implement offline-capable design for rural areas with poor connectivity",
            "Include multilingual support (English, Twi, other local languages)",
            "Ensure compliance with Ghana's data protection and health information policies",
            "Design mobile-first interface for healthcare workers using smartphones",
            "Include Mobile Money integration for billing (popular payment method in Ghana)"
        ])
        
        insights['recommendations'] = recommendations
        
        # Convert sets to lists for JSON serialization
        insights['facility_types'] = list(insights['facility_types'])
        
        insights_filename = f"ehr_insights_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(insights_filename, 'w', encoding='utf-8') as f:
            json.dump(insights, f, indent=2, ensure_ascii=False)
        
        logging.info(f"EHR insights saved to {insights_filename}")
        return insights
    
    def analyze_discovered_links(self):
        """Analyze discovered links for EHR-relevant content"""
        if not hasattr(self, 'discovered_links'):
            return
        
        ehr_relevant_keywords = [
            'digital', 'electronic', 'system', 'data', 'record', 'information',
            'technology', 'telemedicine', 'e-health', 'health information',
            'medical record', 'patient data', 'database', 'software'
        ]
        
        relevant_links = []
        for link in self.discovered_links:
            text = link['text'].lower()
            url = link['url'].lower()
            
            relevance_score = 0
            for keyword in ehr_relevant_keywords:
                if keyword in text or keyword in url:
                    relevance_score += 1
            
            if relevance_score > 0:
                link['ehr_relevance_score'] = relevance_score
                relevant_links.append(link)
        
        # Sort by relevance score
        relevant_links.sort(key=lambda x: x['ehr_relevance_score'], reverse=True)
        
        # Store for insights
        self.scraped_data['ehr_relevant_links'] = relevant_links[:20]  # Top 20
        
        logging.info(f"Found {len(relevant_links)} EHR-relevant links")
        for link in relevant_links[:5]:  # Log top 5
            logging.info(f"EHR-relevant: {link['text']} (score: {link['ehr_relevance_score']})")

    def run_scraper(self):
        """Run the complete scraping process"""
        logging.info("Starting MOH website scraping...")
        
        try:
            self.scrape_main_page()
            self.analyze_discovered_links()
            time.sleep(2)  # Be respectful to the server
            
            self.scrape_health_policies()
            time.sleep(2)
            
            self.scrape_healthcare_facilities()
            time.sleep(2)
            
            self.scrape_health_programs()
            time.sleep(2)
            
            self.scrape_news_and_updates()
            time.sleep(2)
            
            self.extract_contact_information()
            
            self.save_data()
            insights = self.generate_ehr_insights()
            
            # Print summary
            logging.info("=== SCRAPING SUMMARY ===")
            logging.info(f"Health policies found: {len(self.scraped_data['health_policies'])}")
            logging.info(f"Healthcare facilities found: {len(self.scraped_data['healthcare_facilities'])}")
            logging.info(f"Health programs found: {len(self.scraped_data['health_programs'])}")
            logging.info(f"News updates found: {len(self.scraped_data['news_updates'])}")
            logging.info(f"Contact info entries: {len(self.scraped_data['contact_info'])}")
            logging.info(f"Departments found: {len(self.scraped_data['departments'])}")
            logging.info(f"Total discovered links: {len(getattr(self, 'discovered_links', []))}")
            
            logging.info("Scraping completed successfully!")
            return insights
            
        except Exception as e:
            logging.error(f"Error during scraping: {e}")
            return None

if __name__ == "__main__":
    scraper = MOHScraper()
    insights = scraper.run_scraper()
    
    if insights:
        print("\n=== EHR Development Insights ===")
        print(f"Found {len(insights['regulatory_requirements'])} regulatory documents")
        print(f"Identified facility types: {', '.join(insights['facility_types'])}")
        print("\nCheck the generated JSON and CSV files for detailed data.")
