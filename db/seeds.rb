require 'faker'

5.times do |i|
  Team.create!(
    name: "Team #{i + 1}"
  )
end


User.create!(
  email: "pm@email.com",
  password: "password123",
  first_name: Faker::Name.first_name,
  last_name: Faker::Name.last_name,
  role: "pm"
)



User.create!(
  email: "loader@email.com",
  password: "password123",
  first_name: Faker::Name.first_name,
  last_name: Faker::Name.last_name,
  role: "loader"
)


12.times do
  LoadingList.create!(
    user_id: User.all.sample.id,
    team_id: Team.all.sample.id,
    date: Date.today,
    return_date: Faker::Date.forward(days: rand(1..4)),
    site_name: Faker::Address.city,
    notes: Faker::Lorem.sentence
  )
end

30.times do
  Item.create!(
    name: Faker::Name.name,
    category: Faker::Name.name,
    quantity: Faker::Number.between(from: 5, to: 20)
  )
end

100.times do
  LoadingListItem.create!(
    loading_list_id: LoadingList.all.sample.id,
    item_id: Item.all.sample.id,
    quantity: Faker::Number.between(from: 1, to: 10)
  )
end
