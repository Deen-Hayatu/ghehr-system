import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Tabs, Tab, Paper, List, ListItem, ListItemText } from '@mui/material';

const endpoints = [
  { label: 'Policies', key: 'policies' },
  { label: 'Facilities', key: 'facilities' },
  { label: 'Programs', key: 'programs' },
  { label: 'News', key: 'news' },
  { label: 'Contacts', key: 'contacts' },
  { label: 'Insights', key: 'insights' },
];

export default function MOHDashboard() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/moh/${endpoints[tab].key}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>MOH Ghana Data Dashboard</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        {endpoints.map((e, i) => <Tab key={e.key} label={e.label} />)}
      </Tabs>
      <Paper sx={{ mt: 2, p: 2 }}>
        {loading ? <Typography>Loading...</Typography> : (
          <List>
            {Array.isArray(data)
              ? data.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={item.title || item.issue || item.name || JSON.stringify(item)} secondary={item.url || item.context || item.description || ''} />
                  </ListItem>
                ))
              : Object.keys(data).map((key, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={key} secondary={JSON.stringify(data[key])} />
                  </ListItem>
                ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
