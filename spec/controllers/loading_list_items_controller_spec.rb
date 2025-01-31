RSpec.describe LoadingListItemsController, type: :controller do
  before do
    LoadingListItem.destroy_all
    LoadingList.destroy_all
    Item.destroy_all
    User.destroy_all
    Team.destroy_all

    @user = User.create!(email: 'test@example.com', password: 'password', first_name: 'Test', last_name: 'User', role: 'pm')
    @team = Team.create!(name: 'Test Team')
    @loading_list = LoadingList.create!(user_id: @user.id, team_id: @team.id, date: Date.today, return_date: Date.today + 1, site_name: 'Test Site', notes: 'Test Notes')
    @item = Item.create!(name: 'Test Item', category: 'Test Category', quantity: 10)
    @loading_list_item_attributes = { loading_list_id: @loading_list.id, item_id: @item.id, quantity: 10 }
  end

  describe 'POST /loading_list_items' do
    it 'creates and returns a new loading_list_item' do
      post :create, params: { loading_list_item: @loading_list_item_attributes }

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to include(@loading_list_item_attributes.stringify_keys)
    end
  end
end
